# Feature Specification: Interfaz moderna para landing y dashboard

**Feature Branch**: `015-build-new-ui`

**Created**: 2026-07-15

**Status**: Draft

**Input**: User description: "Build new UI with Chakra UI modern with animations, transitions in colors hover position. Create landing page components and dashboard components for current API connection and DTOs apps. Also optimized code use good React and Next.js practices."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar eventos en landing (Priority: P1)

Un visitante llega al sitio y debe entender inmediatamente qué eventos están disponibles, cuándo ocurren y cómo comprar entradas.

**Why this priority**: Es el primer punto de contacto con posibles compradores. Si la landing no comunica valor rápido, se pierden conversiones.

**Independent Test**: Se puede probar independientemente publicando la landing y midiendo si visitantes nuevos identifican el evento principal y el botón de acción en menos de 30 segundos.

**Acceptance Scenarios**:

1. **Given** un visitante nuevo accede al sitio, **When** carga la página, **Then** ve al menos un evento destacado con nombre, fecha, lugar y una acción principal visible.
2. **Given** un visitante navega desde un celular, **When** hace scroll por la landing, **Then** el contenido se adapta al ancho de pantalla sin scroll horizontal.
3. **Given** un visitante pasa el cursor sobre una tarjeta de evento, **When** ocurre la interacción, **Then** recibe retroalimentación visual (cambio de estado, elevación o resaltado) sin bloquear la navegación.

---

### User Story 2 - Dashboard de usuario autenticado (Priority: P2)

Un usuario registrado accede a su área privada para revisar sus entradas, pedidos y datos personales de forma clara y organizada.

**Why this priority**: Mejora la retención y reduce consultas de soporte al centralizar la información del comprador.

**Independent Test**: Se puede probar independientemente iniciando sesión con una cuenta de prueba y verificando que el usuario encuentre sus entradas activas en menos de 5 clics desde el inicio.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado entra a su dashboard, **When** carga la vista, **Then** ve un resumen de sus entradas y pedidos recientes.
2. **Given** un usuario no tiene entradas compradas, **When** abre el dashboard, **Then** ve un estado vacío amigable con una guía hacia el próximo paso.
3. **Given** el sistema está cargando datos, **When** el usuario abre una sección, **Then** ve un indicador de carga claro antes de que aparezca el contenido.

---

### User Story 3 - Navegación fluida entre secciones (Priority: P3)

El usuario puede moverse entre la landing, el dashboard y las páginas de detalle sin perder el contexto ni experimentar saltos bruscos.

**Why this priority**: Refuerza la percepción de calidad y facilita que los usuarios completen tareas sin fricción.

**Independent Test**: Se puede probar independientemente navegando entre las vistas principales y midiendo que todas las transiciones de página mantengan el estado de navegación visible.

**Acceptance Scenarios**:

1. **Given** un usuario hace clic en un enlace del menú principal, **When** cambia de página, **Then** el menú activo refleja la sección actual.
2. **Given** un usuario usa el botón de retroceso del navegador, **When** vuelve a la página anterior, **Then** el sistema muestra la vista esperada sin perder información relevante.

---

### Edge Cases

- ¿Qué ocurre cuando no hay eventos publicados? La landing debe mostrar un estado vacío que invite a volver más tarde o contactar al organizador.
- ¿Cómo se comporta el dashboard si la sesión expira mientras el usuario navega? Debe redirigir al login sin perder el contexto de la página solicitada.
- ¿Qué pasa si el usuario tiene preferencia de movimiento reducido? Las animaciones deben respetar esa configuración del sistema.
- ¿Cómo se muestra un error al cargar datos del dashboard? Debe aparecer un mensaje claro con una acción para reintentar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La landing page DEBE presentar eventos disponibles con información esencial: nombre, fecha, lugar, imagen representativa y acción principal.
- **FR-002**: El sistema DEBE proporcionar retroalimentación visual en todos los elementos interactivos (botones, enlaces, tarjetas) mediante cambios de estado al pasar el cursor o al enfocar con teclado.
- **FR-003**: El dashboard del usuario autenticado DEBE mostrar un resumen de sus entradas activas, pedidos recientes y acceso rápido a su perfil.
- **FR-004**: Los componentes DEBEN adaptarse a escritorio, tablet y móvil sin generar scroll horizontal ni superposición de elementos.
- **FR-005**: El sistema DEBE comunicar claramente los estados de carga, vacío y error en cada sección que dependa de datos externos.
- **FR-006**: Las transiciones y animaciones DEBEN ser sutiles, no deben bloquear interacciones ni causar molestias; DEBEN respetar la preferencia de movimiento reducido del usuario.
- **FR-007**: La jerarquía visual DEBE guiar la atención del usuario hacia las acciones principales en cada vista.
- **FR-008**: La navegación principal DEBE mantenerse visible y coherente en todas las páginas públicas y privadas.

### Key Entities *(include if feature involves data)*

- **Evento**: Representa una experiencia disponible para compra. Atributos clave: nombre, fecha, lugar, imagen, descripción, tipos de entrada.
- **Entrada**: Representa el derecho de asistencia de un comprador. Atributos clave: evento asociado, estado (activa, usada, cancelada), fecha de compra, datos del asistente.
- **Pedido**: Representa una transacción de compra. Atributos clave: entradas incluidas, estado de pago, fecha, total.
- **Métrica de dashboard**: Representa un dato resumido para el usuario, como cantidad de entradas activas o pedidos recientes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visitante nuevo DEBE identificar el evento destacado y la acción principal en menos de 30 segundos.
- **SC-002**: El contenido visible inicial de la landing DEBE cargar en menos de 2 segundos en una conexión 4G simulada.
- **SC-003**: Un usuario autenticado DEBE encontrar sus entradas activas en menos de 5 clics desde la página de inicio.
- **SC-004**: Al menos el 90 % de los usuarios en una prueba de usabilidad DEBE identificar correctamente el botón de acción principal en la landing.
- **SC-005**: La interfaz DEBE visualizarse correctamente en dispositivos móviles, tabletas y escritorios sin scroll horizontal ni elementos cortados.
- **SC-006**: Las interacciones principales (clics, hovers, foco) DEBEN responder en menos de 100 milisegundos percibidos.

### User Story 4 - Errores de checkout como modales accionables (Priority: P2)

Un usuario en el checkout recibe feedback claro y accionable cuando algo impide completar el pago: perfil incompleto, entradas agotadas, exceso de límite por usuario o fallos de red. Cada error se muestra como un modal con la causa específica y un siguiente paso.

**Why this priority**: Reduce fricción y abandono en el momento más crítico del funnel de compra. Un mensaje genérico "User info incomplete" obliga al usuario a adivinar qué falta.

**Independent Test**: Disparar cada código de error (`USER_INFO_INCOMPLETE`, `SOLD_OUT`, `MAX_PER_USER_EXCEEDED`, error de red) y verificar que el modal correspondiente aparece con su acción correcta.

**Acceptance Scenarios**:

1. **Given** un usuario con cédula o nombre vacío, **When** entra al checkout, **Then** el botón "Pagar" está deshabilitado con tooltip explicando que debe completar su perfil.
2. **Given** un usuario omite el pre-check y envía el checkout, **When** el backend responde `USER_INFO_INCOMPLETE`, **Then** se abre un modal listando los campos faltantes con CTA "Completar perfil" hacia `/mi-cuenta/perfil`.
3. **Given** el backend responde `SOLD_OUT` o `MAX_PER_USER_EXCEEDED`, **When** el usuario ve el error, **Then** se muestra un modal con el nombre de la entrada afectada y CTA para ajustar el carrito.
4. **Given** un fallo de red o error inesperado, **When** ocurre, **Then** se muestra un modal con mensaje neutro y botón "Reintentar" que reintenta la operación.

---

## Assumptions

- Los endpoints de datos y los contratos de información existentes no cambian; esta funcionalidad consume lo que ya está disponible.
- El dashboard objetivo es el área de usuario autenticado. Mejoras al panel de administración quedan fuera del alcance salvo que reutilicen componentes genéricos.
- Los usuarios usan navegadores modernos que soportan animaciones y diseño responsivo.
- Se seguirán estándares de accesibilidad WCAG 2.1 nivel AA, incluyendo soporte para navegación por teclado y lectores de pantalla.
- Las animaciones respetarán la preferencia `prefers-reduced-motion` del sistema operativo o navegador.
