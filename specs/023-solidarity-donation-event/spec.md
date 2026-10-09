# Feature Specification: Reestructuración solidaria — La U del Futuro 2026

**Feature Branch**: `023-solidarity-donation-event`

**Created**: 2026-10-09

**Status**: Draft

**Input**: Reorientar la plataforma de venta y gestión de entradas para la Convención de Egresados UTP 2026 hacia una jornada institucional, académica y solidaria. La Convención se realizará el sábado 24 de octubre de 2026. La web pública presentará el evento y facilitará únicamente donaciones a UTPton; no ofrecerá destinos de la Asociación de Egresados ni Barranqueros, no venderá entradas ni administrará asistencia. La donación, su pasarela actual, el contador automático y la meta editable desde admin ya funcionan y deben conservarse. Deshabilitar en Express los endpoints del negocio anterior, excepto los endpoints de donación y los mínimos de autenticación/admin necesarios para ingresar y administrar el contador/meta. Las cuentas administrativas conservarán su acceso. No eliminar páginas antiguas: ocultarlas o redirigirlas a inicio. Renovar identidad visual con los recursos existentes en `frontend/public/assets/utpton/`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Conocer La U del Futuro y su programación (Priority: P1)

Como visitante, quiero entender el propósito de la Convención, su agenda del sábado 24 de octubre y las formas de apoyar a la comunidad, para decidir cómo participar o donar.

**Why this priority**: La portada es la entrada pública principal y debe comunicar el nuevo propósito sin ofrecer compra o registro de asistentes.

**Independent Test**: Abrir inicio en móvil y escritorio y comprobar que presenta el nombre del evento, la jornada del 24 de octubre, los ejes programáticos, la agenda y una llamada a donar, sin controles de compra o inscripción.

**Acceptance Scenarios**:

1. **Given** un visitante anónimo, **When** abre la página de inicio, **Then** ve “La U del Futuro 2026”, el concepto “Encuentro, Reactivación y Solidaridad”, el sábado 24 de octubre de 2026 y el propósito de apoyo a la comunidad UTP.
2. **Given** la portada, **When** el visitante consulta la programación, **Then** encuentra los espacios académicos, la feria permanente, el almuerzo/feria gastronómica, la Asamblea ASEUTP, el networking, el momento de memoria, los Egresados Distinguidos y la noche cultural en el orden y horarios definidos en esta spec.
3. **Given** la portada en cualquier tamaño de pantalla, **When** el visitante busca cómo ayudar, **Then** encuentra una llamada clara que conduce al flujo público de donación.
4. **Given** recursos de marca UTPton disponibles, **When** se renderiza la página, **Then** se usan los logos y piezas de `frontend/public/assets/utpton/` sin deformación y con contraste legible.

### User Story 2 - Donar sin cuenta ni compra (Priority: P1)

Como persona que desea apoyar la campaña UTPton, quiero completar una donación sin crear una cuenta, iniciar sesión ni comprar una entrada.

**Why this priority**: El recaudo solidario pasa a ser la única transacción pública principal del sitio.

**Independent Test**: En una sesión anónima, seguir una llamada a donar, completar un aporte con cada medio que el producto mantenga habilitado y volver desde el resultado del proveedor; confirmar que no se exige cuenta, entrada ni registro de asistencia.

**Acceptance Scenarios**:

1. **Given** un visitante sin sesión, **When** elige donar, **Then** puede iniciar y completar el flujo actual sin crear cuenta ni iniciar sesión.
2. **Given** las instrucciones y medios de donación vigentes, **When** el visitante consulta cómo aportar, **Then** la web ofrece exclusivamente UTPton como destino solidario y no presenta el aporte como precio de entrada.
3. **Given** un retorno exitoso, pendiente o fallido del proveedor de pago, **When** el visitante vuelve al sitio, **Then** ve el estado de su donación y puede volver a inicio sin ser enviado a una página de entradas o cuenta.
4. **Given** un usuario anónimo que no termina el aporte, **When** abandona el flujo, **Then** el sitio no crea una cuenta ni una inscripción al evento como efecto secundario.
5. **Given** una donación confirmada, **When** se actualiza el contador, **Then** el acumulado público refleja el mecanismo actual y muestra la meta configurada por el personal.
6. **Given** un administrador autorizado, **When** ajusta la meta o corrige el valor actual del contador desde su panel, **Then** el contador público refleja los valores guardados.

### User Story 3 - Mantener acceso del personal y cerrar el acceso público anterior (Priority: P1)

Como integrante autorizado del personal, quiero seguir iniciando sesión y administrando las donaciones y su contador; como visitante o usuario regular, no quiero poder crear una cuenta, iniciar sesión como comprador, comprar entradas ni usar páginas/endpoints antiguos de asistencia.

**Why this priority**: La operación administrativa sigue siendo necesaria, mientras que registro, venta y gestión de asistentes dejaron de formar parte del evento.

**Independent Test**: Probar páginas y endpoints como visitante anónimo, usuario `client` y administrador. El público debe volver a inicio desde las rutas antiguas; el admin conserva acceso al panel de donaciones/contador y los endpoints viejos del negocio quedan deshabilitados.

**Acceptance Scenarios**:

1. **Given** un visitante sin sesión, **When** intenta abrir registro, compra, entradas, checkout o cuenta personal, **Then** no puede completar esos flujos y vuelve al inicio.
2. **Given** un usuario regular autenticado con rol `client`, **When** intenta abrir `/admin`, una ruta de administración o la entrada de personal, **Then** se le deniega el acceso y se le envía a inicio.
3. **Given** un integrante autorizado (`admin`, `super_admin` o `checker`), **When** usa la ruta de acceso de personal y abre las funciones permitidas por su rol, **Then** conserva el acceso administrativo actual.
4. **Given** una ruta pública antigua de entradas, registro, checkout o asistencia, **When** se solicita directamente, **Then** vuelve a inicio sin borrar la página ni sus componentes del repositorio.
5. **Given** una ruta requerida para iniciar/cerrar sesión del personal, recuperar su sesión o retornar de un pago de donación, **When** se solicita, **Then** continúa funcionando aunque las rutas públicas antiguas estén ocultas.
6. **Given** la navegación pública y administrativa, **When** se muestran los enlaces, **Then** no aparecen “Comprar entradas”, “Inscríbete”, “Mis entradas”, registro ni inicio de sesión público; los enlaces administrativos siguen disponibles solo para personal autorizado.
7. **Given** el panel administrativo, **When** se revisan las funciones disponibles, **Then** la lista de donaciones y la edición del contador/meta continúan disponibles, mientras las funciones de venta/gestión de entradas no se ofrecen en esta operación.
8. **Given** una llamada directa a un endpoint viejo de venta, perfil de usuario o asistencia, **When** llega a Express, **Then** no ejecuta la operación y responde como endpoint deshabilitado/no disponible.

### User Story 4 - Consultar la jornada y su propósito solidario (Priority: P2)

Como egresado, estudiante, aliado o donante, quiero comprender por qué cambió la Convención y qué representa cada bloque, para reconocer el valor académico, económico, institucional y conmemorativo de la jornada.

**Why this priority**: La comunicación explica la reestructuración por el sismo y conecta la programación con la reactivación y la solidaridad.

**Independent Test**: Revisar la página en español y comprobar que expresa los cuatro ejes, justifica el formato de un día y presenta la agenda sin datos contradictorios de fechas o venta de entradas.

**Acceptance Scenarios**:

1. **Given** la sección de propósito, **When** el visitante la lee, **Then** reconoce los ejes de futuro e IA; empleabilidad, emprendimiento y reactivación; encuentro de egresados; y solidaridad, memoria y reconstrucción.
2. **Given** la agenda publicada, **When** se muestra la franja de 6:30 p. m., **Then** se describe el homenaje a las víctimas del sismo del 10 de agosto de 2026 y a integrantes de la comunidad universitaria fallecidos, con redacción respetuosa.
3. **Given** información histórica del sitio sobre el programa anterior de tres días, **When** se publica la nueva programación, **Then** la fecha vigente se presenta como sábado 24 de octubre de 2026, sin fechas anteriores que aparenten ser la programación actual.

## Event Content

La página de evento presenta la siguiente propuesta programática en una jornada. La feria de empleabilidad, emprendimiento y reactivación empresarial permanece disponible durante todo el día.

| Hora | Actividad | Presentación requerida |
|---|---|---|
| Durante todo el día | Feria de empleabilidad, emprendimiento y reactivación empresarial | Conexión de egresados, empresas, emprendedores y oportunidades; incluir egresados emprendedores/PYMES y emprendedores barranqueros como participantes propuestos. |
| 8:30 a. m. | Apertura de la Convención | Instalación institucional y presentación de los propósitos académico, empresarial y solidario. |
| 9:00–9:30 a. m. | Conferencia de apertura: Inteligencia Artificial y perspectiva | IA, transformación, retos y reactivación económica. |
| 9:30–10:00 a. m. | Visión institucional: La Universidad del Futuro | Visión institucional, innovación y transformación tecnológica. |
| 10:30–11:30 a. m. | Panel de expertos en Inteligencia Artificial | Universidad, sociedad, empleabilidad, empresa y transformación. |
| 11:30 a. m.–12:30 p. m. | Conferencias temáticas por facultades | Modalidad virtual; ambiegresados y salud podrán evaluarse para presencialidad, sin presentarla como confirmada. |
| 12:30–2:00 p. m. | Feria gastronómica y música en vivo | Franja de almuerzo, empresarios egresados y espacio de encuentro. |
| 2:00–4:30 p. m. | Asamblea de la ASEUTP | Participación estatutaria de egresados; se recomienda presencial. |
| 4:30–6:30 p. m. | Networking de egresados | Relacionamiento con muestras y agrupaciones culturales universitarias. |
| 6:30–7:00 p. m. | Momento solemne de memoria y conmemoración | Homenaje a las víctimas del sismo y memoria de miembros de la comunidad universitaria fallecidos. |
| 7:00–8:00 p. m. | Ceremonia de Egresados Distinguidos | Reconocimiento institucional y encuentro solemne. |
| Cierre | Noche cultural | Artista invitado, Orquesta Sinfónica de la UTP y Grupo de Salsa de la UTP. |

## Edge Cases

- Si un usuario regular conserva una sesión de una versión anterior, la sesión no debe otorgarle acceso a administración ni devolverle las rutas de cuenta o compra.
- Si el personal abre una URL profunda del panel sin sesión, debe poder autenticarse y regresar al panel solicitado una vez autorizado.
- Si una ruta obsoleta es solicitada con parámetros de consulta, debe redirigirse a inicio sin filtrar parámetros sensibles ni interrumpir los retornos de donación.
- Si el proveedor devuelve un estado de donación pendiente, la pantalla debe explicar que el aporte no está confirmado todavía y permitir consultar el resultado según el flujo vigente.
- Si falta un logo o recurso visual esperado, el diseño debe conservar un nombre de evento legible y no mostrar imágenes rotas.
- Si `metaValue` no tiene un valor positivo configurado, la interfaz no debe inventar una cifra; conserva el contador actual según su comportamiento vigente.
- Si se cambia el valor/meta desde admin, la portada y el panel deben mostrar los valores guardados sin reiniciar ni reemplazar el contador automático.
- Si el horario o modalidad de una actividad no está confirmado, la web debe conservar la nota de propuesta/evaluación en lugar de afirmar una decisión final.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La página pública principal MUST presentar la Convención como “La U del Futuro 2026” y usar el concepto “Encuentro, Reactivación y Solidaridad”.
- **FR-002**: La comunicación MUST explicar el cambio desde el formato de tres días hacia una jornada institucional el sábado 24 de octubre de 2026, motivado por las circunstancias del sismo del 10 de agosto de 2026.
- **FR-003**: La página pública MUST presentar los cuatro ejes programáticos: futuro e inteligencia artificial; empleabilidad, emprendimiento y reactivación económica; encuentro de egresados; solidaridad, memoria y reconstrucción.
- **FR-004**: La página MUST mostrar la programación detallada de esta spec con fechas, horarios, nombres y descripciones coherentes, marcando como propuestas las modalidades aún sujetas a evaluación.
- **FR-005**: La página pública MUST destacar la donación como la única transacción pública principal y MUST indicar que el aporte fortalece el fondo de solidaridad; MUST NOT presentarlo como pago de entrada o requisito para participar.
- **FR-006**: Un donante MUST poder iniciar y completar un aporte sin crear una cuenta, iniciar sesión, comprar entrada, registrarse como asistente ni confirmar asistencia.
- **FR-007**: El sitio MUST conservar los medios y el flujo de donación que estén vigentes y aprobados, incluidos sus retornos de éxito, pendiente y fallo.
- **FR-008**: El sitio MUST ocultar del acceso público los flujos de registro, inicio de sesión regular, compra, selección de entradas, checkout, cuenta de usuario, tickets y check-in/asistencia.
- **FR-009**: Las solicitudes directas a las páginas públicas anteriores MUST redirigirse a inicio sin eliminar las páginas ni los componentes del repositorio.
- **FR-010**: El cierre de rutas públicas MUST conservar las rutas de retorno necesarias para donaciones, callback de autenticación del personal y rutas administrativas autorizadas.
- **FR-011**: La autenticación administrativa MUST seguir disponible para `admin`, `super_admin` y `checker` de acuerdo con los permisos actuales. Un usuario `client` MUST ser redirigido a inicio y MUST NOT acceder a `/admin` ni a rutas del personal.
- **FR-012**: La navegación pública MUST retirar enlaces a compra, registro, entradas, cuenta de usuario e inicio de sesión regular; los enlaces del panel MUST respetar los roles vigentes.
- **FR-013**: La identidad visual MUST migrar al nombre, logos y recursos provistos para UTPton/La U del Futuro, disponibles en `frontend/public/assets/utpton/`, y MUST mantener legibilidad y uso proporcionado de logos.
- **FR-014**: Las pantallas públicas MUST funcionar en dispositivos móviles y escritorio, incluido el flujo de donación y la programación.
- **FR-015**: El contenido MUST NOT hardcodear una meta o montos sugeridos ni presentar como oficiales artistas, modalidades u otros datos tentativos. La meta pública proviene del valor actualmente guardado y editable desde admin, conforme a FR-019.
- **FR-016**: Los términos, avisos y navegación pública que describan compra de entradas, emisión de QR, inscripción o seguimiento de asistencia MUST actualizarse para no contradecir el nuevo modelo; las obligaciones legales vigentes para donaciones y tratamiento de datos MUST conservarse.
- **FR-017**: La donación MUST permanecer disponible aunque el visitante no acepte crear una cuenta o no disponga de una sesión de usuario regular.
- **FR-018**: La campaña MUST ofrecer exclusivamente UTPton como destino de donación; no debe ofrecer destinos de Asociación de Egresados ni Barranqueros.
- **FR-019**: El contador de donaciones MUST conservar su actualización automática al confirmar donaciones y MUST mostrar el valor/meta guardados actualmente. El personal administrativo autorizado MUST poder seguir ajustando `currentValue` y `metaValue` desde el panel.
- **FR-020**: Express MUST deshabilitar endpoints del negocio anterior para listado/compra/gestión de entradas, pagos de entradas, cuenta/perfil de usuarios regulares, registro/aceptación de políticas, confirmación y check-in/asistencia, incluidos endpoints administrativos de esas funciones.
- **FR-021**: Express MUST conservar los endpoints de donación y webhook/estado asociados, además de los endpoints mínimos de sesión/identidad administrativa, listado admin de donaciones y lectura/edición admin del contador/meta necesarios para la operación actual.
- **FR-022**: Las llamadas directas a endpoints deshabilitados MUST fallar sin ejecutar lógica de negocio; ocultar páginas o enlaces en el frontend no cuenta como desactivación del endpoint.
- **FR-023**: El inicio de sesión de personal MUST permanecer disponible, pero el rol `client` MUST NOT completar un inicio de sesión para la experiencia pública ni acceder a endpoints/páginas administrativas.

### Key Entities *(include if data involved)*

- **Jornada La U del Futuro 2026**: Evento institucional de un día con fecha, concepto, ejes, actividades, horarios y modalidades confirmadas o sujetas a evaluación.
- **Aporte solidario**: Donación voluntaria destinada al fondo de apoyo a la comunidad UTP afectada; contiene el estado necesario para completar y consultar el resultado del pago.
- **Personal autorizado**: Usuario con rol administrativo existente que puede autenticarse y operar únicamente las funciones permitidas por su rol.
- **Visitante/donante**: Persona que consulta la información pública y puede donar sin cuenta, entrada o inscripción de asistencia.

## Express API Availability

Las rutas de donación actuales permanecen activas. Además se conserva el mínimo administrativo para autenticar al personal y operar el contador. El destino de nuevas donaciones se valida en backend como UTPton; solicitudes directas no pueden escoger los destinos históricos de Asociación de Egresados o Barranqueros.

| Estado | Rutas | Motivo |
|---|---|---|
| Mantener | `POST /api/donaciones`, `POST /api/donaciones/webhook/:provider`, `GET /api/donaciones/counter`, `GET /api/donaciones/:externalReference/status` | Flujo público existente de donación UTPton, confirmación y contador. |
| Mantener para personal autorizado | `GET /api/auth/session`, `GET /api/admin/me`, `GET /api/admin/donations`, `PUT /api/admin/donations/counter` | Acceso administrativo, listado de donaciones y edición de contador/meta. |
| Deshabilitar | `/api/tickets/*`, `/api/admin/tickets/*`, `/api/me/*`, `/api/users/*`, `/api/payments/*`, `/api/confirmations/*`, `/internal/checkin/*`, `/api/admin/users/*`, `/api/admin/payments/*`, `/api/admin/analytics/*`, `/api/audit-log/*` | Compra, gestión de entradas, perfiles/cuentas regulares, pagos de entradas y asistencia ya no son parte de la operación. |

Las páginas y módulos deshabilitados permanecen en el repositorio. Cualquier endpoint no enumerado como permitido deja de ejecutar su lógica de negocio en este modo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En las rutas públicas visibles, 0 llamadas a comprar entradas, registrarse, acceder a una cuenta regular o confirmar asistencia.
- **SC-002**: Un visitante anónimo puede llegar desde inicio al flujo de donación UTPton sin autenticación y completar un aporte de prueba usando los medios actuales.
- **SC-003**: 100% de las rutas públicas de compra, registro, tickets, cuenta y asistencia redirigen a inicio; 100% de las rutas necesarias para donar y autenticarse como personal siguen operativas.
- **SC-004**: `admin`, `super_admin` y `checker` conservan el acceso administrativo correspondiente a sus roles; `client` no accede a ninguna ruta administrativa.
- **SC-005**: La fecha y el programa vigentes se identifican sin ambigüedad como una jornada el 24 de octubre de 2026 y no se presenta la antigua programación de tres días como vigente.
- **SC-006**: En revisión de contenido, cada actividad de la tabla de esta spec aparece con horario y descripción correctos, y toda modalidad no confirmada conserva su carácter tentativo.
- **SC-007**: En una revisión responsive, la portada, el llamado a donar y la agenda pueden consultarse sin contenido cortado ni controles inutilizables en móvil y escritorio.
- **SC-008**: El contador y la meta administrable actuales continúan visibles y actualizados; no se ofrecen otros destinos de donación ni hay imágenes rotas en recursos UTPton.
- **SC-009**: 100% de los endpoints antiguos de tickets, compra, clientes, pagos de entradas y asistencia están deshabilitados en Express, mientras los endpoints de donación y las excepciones admin/autenticación enumeradas siguen respondiendo.
- **SC-010**: Una modificación administrativa de la meta/contador se refleja en la vista pública sin reemplazar el incremento automático de donaciones confirmadas.

## Assumptions

- La donación, los proveedores actuales y su proceso funcionan; se conservan en lugar de crear una pasarela nueva.
- Las nuevas donaciones tienen como único destino UTPton. Los registros históricos se conservan sin reclasificación.
- Los valores del contador y de la meta guardados desde administración son la fuente pública; la meta no se hardcodea ni se reemplaza por un valor de ejemplo.
- La fecha oficial del evento para la web es sábado 24 de octubre de 2026; las referencias visuales a los días 22 y 23 de octubre pertenecen a una propuesta anterior y no deben publicarse como fechas vigentes.
- Las páginas antiguas se preservan en el código, pero el público ya no puede acceder a sus funciones; redirigir a inicio es el comportamiento solicitado.
- “Usuarios normales” significa visitantes anónimos y usuarios regulares con rol `client`; no incluye `admin`, `super_admin` ni `checker`.
- Las cuentas bancarias, direcciones de entrega y datos de transferencia UTPton se comunican desde materiales institucionales vigentes; no se cambian ni se infieren valores en esta spec.
- La propuesta de conferencia por facultades es virtual; la presencialidad de Ambiegresados y Salud está por evaluar. Asamblea ASEUTP se recomienda presencial, sin convertir la recomendación en requisito de acceso.
- Los nombres de artistas y agrupaciones solo se publican cuando estén confirmados; la spec conserva la formulación de propuesta del documento fuente.
- El acceso directo de personal queda disponible en una ruta de autenticación no expuesta en la navegación pública; la autorización de rol se valida antes de conceder acceso administrativo.
- Las funciones admin activas en este modo se limitan a acceso/sesión del personal y gestión de donaciones/contador; los endpoints de tickets, usuarios regulares, pagos de entradas y asistencia dejan de operar.
