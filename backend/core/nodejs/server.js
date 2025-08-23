require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

/* ==== FUNCIONES PARA OPTIMIZAR CODIGO EN EL FORMATO DE RESPUESTA DE ENDPOINTS ==== */

/**
 * Envía una respuesta HTTP 200 exitosa con formato JSON estándar.
 * 
 * Está función centraliza la configuración de respuestas exitosas para mantener
 * consistencia en headers y formato a través de toda la API.
 * 
 * Se crea para mejorar legibilidad en los nuevos endpoints del reto.
 * 
 * @param {Object} response - El objeto response de Express
 * @param {*} data - Los datos a enviar en el body de la respuesta (cualquier tipo serializable a JSON)
 */
function sendOkResponse(response, data) {
  response
      .status(200)
      .type('application/json; charset=utf-8')   // Content-Type explícito
      .set('Cache-Control', 'no-store')          // refuerzo por ruta
      .json(data);
}

/**
 * Envía una respuesta HTTP de error con formato JSON estándar.
 * 
 * Se crea para mejorar legibilidad en los nuevos endpoints del reto.
 * 
 * @param {Object} response - El objeto response de Express
 * @param {number} statusCode - Código de estado HTTP (ej: 400, 404, 500)
 * @param {string} message - Mensaje de error descriptivo
 */
function sendErrorResponse(response, statusCode, message) {
  response
    .status(statusCode)
    .type('application/json; charset=utf-8')
    .set('Cache-Control', 'no-store')
    .json({
      error: message,
      timestamp: new Date().toISOString()
    });
}


/* ===== Hardening y headers ===== */
// 1) Desactiva ETag para que NUNCA devuelva 304
app.set('etag', false);

// 2) Desactiva X-Powered-By (higiene)
app.disable('x-powered-by');

// 3) Fuerza no-cache a nivel global (puedes afinar por ruta si prefieres)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');     // sin cache
  next();
});

/* ===== Middlewares ===== */
app.use(express.json());

// CORS desde ALLOWED_ORIGINS (mantengo tu lógica)
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  }
}));

/* ===== Conexión a MongoDB ===== */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado a MongoDB Atlas"))
.catch(err => console.error("❌ Error de conexión:", err));


/* ==== Modelo (Colección registrations) ==== */
const registrationSchema = new mongoose.Schema({
  fullName: String,
  trainingCenter: String,
  trainingProgram: String,
  recommendedInstructor: String,
  residenceDepartment: String,
  githubUser: String,
  englishLevel: String
}, { collection: 'registrations' });

const Registration = mongoose.model('Registration', registrationSchema);

/* ===== Modelo (colección metrics_scalar) ===== */
const metricSchema = new mongoose.Schema({}, { strict: false });
const Metric = mongoose.model('metrics_scalar', metricSchema, 'metrics_scalar');

/* ===== Endpoints ===== */

// GET /metrics/scalar  → JSON siempre, sin 304 y sin cache
app.get('/metrics/scalar', async (req, res) => {
  try {
    const data = await Metric.find({}).lean();

    // Si quieres devolver SOLO los campos que usa el GPT:
    // const projected = data.map(({ description, value }) => ({ description, value }));

    res
      .status(200)
      .type('application/json; charset=utf-8')   // Content-Type explícito
      .set('Cache-Control', 'no-store')          // refuerzo por ruta
      .json(data);                               // o .json(projected)
  } catch (err) {
    res
      .status(500)
      .type('application/json; charset=utf-8')
      .json({ error: err.message });
  }
});

/* ========== NUEVOS ENDPOINTS PARA EL RETO :) ========== */

// 1. Cantidad de aprendices inscritos por centros de formación
app.get('/metrics/apprentices-by-center', async (req, res) => {
  try {
    const data = await Registration.aggregate([
      // Se agrupa por centro de formación y se cuenta el número de aprendices
      { $group: { _id: "$trainingCenter", count: { $sum: 1 } } },
      { $project: { _id: 0, trainingCenter: "$_id", totalApprentices: "$count" } },
      { $sort: { totalApprentices: -1 } }
    ]);
    
    sendOkResponse(res, data);
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
});

// 2. Nombres de los instructores recomendados por centros de formación
app.get('/metrics/instructors-by-center', async (req, res) => {
  try {
    // Se agrupa por centro de formación y se retorna los nombres de los instructores por cada centro
    const data = await Registration.aggregate([
      { $group: { _id: "$trainingCenter", instructors: { $addToSet: "$recommendedInstructor" } } },
      { $project: { _id: 0, trainingCenter: "$_id", recommendedInstructors: "$instructors" } }
    ]);

    sendOkResponse(res, data);
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
});

// 3. Cantidad de aprendices inscritos por centro y programa de formación
app.get('/metrics/apprentices-by-center-program', async (req, res) => {
  try {
    const data = await Registration.aggregate([
      // Se agrupa por centro de formación y programa y se cuenta el número de aprendices inscritos
      { $group: { _id: { center: "$trainingCenter", program: "$trainingProgram"}, count: { $sum: 1 } } },
      { $project: { _id: 0, trainingCenter: "$_id.center", trainingProgram: "$_id.program", totalApprentices: "$count" } },
      { $sort: { trainingCenter: 1, totalApprentices: -1 } }
    ]);

    sendOkResponse(res, data);
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
});

// 4. Cantidad de aprendices por departamento y residencia
app.get('/metrics/apprentices-by-department', async (req, res) => {
  try {
    const data = await Registration.aggregate([
      // Se agrupa por departamentos y se cuenta el numero de aprendices inscritos
      { $group: { _id: "$residenceDepartment", count: { $sum: 1 } } },
      { $project: { _id: 0, residenceDepartment: "$_id", totalApprentices: "$count" } },
      { $sort: { totalApprentices: -1 } }
    ]);
    sendOkResponse(res, data);
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
});

// 5. Cantidad de aprendices que reportan tener un usuario de GitHub
app.get('/metrics/github-users', async (req, res) => {
  try {
    // Se cuenta la cantidad de documentos con githubUser, la cantidad que NO tiene y la cantidad total de registros
    const totalWithGithub = await Registration.countDocuments({ githubUser: { $ne: null, $exists: true } });
    const totalRegistrations = await Registration.countDocuments();
    sendOkResponse(res, {
      totalWithGithub,
      totalWithoutGithub: totalRegistrations - totalWithGithub,
      totalRegistrations
    });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
});

// 6. Cantidad de aprendices que reportan tener un nivel de ingles B1 o B2 en cada centro
app.get('/metrics/english-level-by-center', async (req, res) => {
  try {
    const data = await Registration.aggregate([
      { $match: { englishLevel: { $in: ["B1", "B2"] } } },
      { $group: { _id: "$trainingCenter", count: { $sum: 1 } } },
      { $project: { _id: 0, trainingCenter: "$_id", totalB1B2: "$count" } },
      { $sort: { totalB1B2: -1 } }
    ]);
    sendOkResponse(res, data);
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
});

/* (Opcional) Healthcheck rápido */
app.get('/health', (_req, res) => {
  res
    .status(200)
    .type('application/json; charset=utf-8')
    .set('Cache-Control', 'no-store')
    .json({ ok: true });
});

/* ===== Iniciar servidor ===== */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
