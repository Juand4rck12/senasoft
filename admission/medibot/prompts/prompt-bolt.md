##  Prompt🚀: Desarrollo en Bolt

**Prompt Principal utilizado en Bolt:**

### Prototipo de MediBot (Interfaz Conversacional)

 #### OBJETIVO PRINCIPAL:
 Crea una aplicación web móvil (mobile-first) para MediBot. La interfaz debe ser conversacional, similar a la de WhatsApp, con el objetivo de ser extremadamente intuitiva y accesible para personas mayores y con movilidad reducida.

 #### ESPECIFICACIONES DEL DISEÑO:
 - **Vibe:** Amigable, limpia y tranquilizadora.
 - **Colores:** Usa una paleta similar a WhatsApp (#E5DDD5 para el fondo del chat, white o card para los mensajes del bot, #DCF8C6 para los mensajes del usuario).
 - **Componentes:** Utiliza shadcn UI o componentes que sigan una estética moderna y sin "ruido".
 - **Iconografía:** Incluye iconos relevantes de lucide-react para la navegación y las acciones.

 #### ESTRUCTURA Y PÁGINAS:
 - **Dashboard Principal (Página del Chat):**
     - **Encabezado:** Un encabezado fijo en la parte superior que muestre el estado del usuario. Debe incluir un punto verde animado (animate-pulse), el nombre del usuario y su nivel de prioridad (ej. "María Paulina - Prioridad 1"). También debe tener una Badge de "Urgente" en rojo.
     - **Área de Mensajes:** Un contenedor con overflow-y-auto que muestre los mensajes del chat.
         - Los mensajes del bot deben tener un Avatar con las iniciales "MB" y un fondo oscuro/primario. Los mensajes deben tener bordes redondeados, excepto en la esquina inferior izquierda.
         - Los mensajes del usuario deben estar alineados a la derecha, con un fondo verde claro y bordes redondeados, excepto en la esquina inferior derecha.
         - Cada mensaje debe incluir el texto y la hora de envío en una esquina inferior.
 - **Sección de Acciones Rápidas:**
     - Ubicada encima de la barra de entrada de texto.
     - Un grid de 2x2 con Buttons que representan acciones comunes.
     - Cada botón debe tener un ícono y texto como: "🚚 Entrega rápida", "💊 Mis medicamentos", "👨‍⚕ Hablar con doctor" y "📍 Rastrear pedido".
     - La acción de un botón debe llenar la barra de entrada de texto con el texto del botón.

 #### FLUJOS DE INTERACTIVIDAD:
 - **Envío de Mensajes:**
     - **Barra de Entrada:** Un Input con un placeholder "Escribe un mensaje..." y botones para adjuntar una foto (Camera) y un micrófono (Mic).
     - **Botón de Envío:** Un botón redondo a la derecha de la barra de entrada. Si el campo de texto está vacío, muestra un ícono de micrófono. Si el campo de texto tiene contenido, muestra un ícono de enviar (Send) y el botón debe cambiar a color verde (#25D366).
     - **Lógica:** Al presionar el botón de enviar o la tecla Enter, el mensaje del usuario se agrega al chat. Inmediatamente después, el bot simula una respuesta del agente de IA.

 #### Integración con el Agente de IA:
 - Simula la llamada a un servicio de IA.
 - El prompt para la IA debe incluir el mensaje del usuario y el contexto del perfil (nombre y prioridad).
 - La respuesta de la IA debe ser concisa, empática y relevante para la consulta del usuario.
 - Añade la respuesta de la IA al chat como un nuevo mensaje del bot.

### CONTEXTO DEL PRODUCTO VALIDADO:
MediBot es un ecosistema de apoyo integral para pacientes vulnerables en Colombia, que resuelve los problemas de filas y falta de medicamentos.
 
## 7. 🔧 PROMPTS DE MEJORAS ITERATIVAS

- **Agente de Teleconsulta Básica (Agent-TeleDoc):** "Implementa un agente que permita a los usuarios agendar una teleconsulta con un médico para renovar una fórmula o hacer una consulta rápida."
- **Soporte por Voz:** "Implementa una iteración que permita al usuario llamar a MediBot y que este, a través de voz, lo guíe en su proceso, como pedir una cita o pedir su medicamento."
- **Interfaz de Administración:** "Crea un panel de administración para las farmacias y EPS, donde puedan ver los turnos asignados por MediBot, el inventario de medicamentos y el historial de entrega a domicilio de cada usuario."

### Modelo de Negocio y Escalabilidad
MediBot opera con un modelo de negocio híbrido, lo que le permite generar ingresos y crecer de manera sostenible mientras cumple su misión social.