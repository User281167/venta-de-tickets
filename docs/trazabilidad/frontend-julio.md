# Trazabilidad Frontend — Julio 2026

Resumen día a día del trabajo realizado en el frontend durante julio 2026.
Fuente: `git log -- frontend/` del monorepo.

## 01/Jul/2026 — Tickets CRUD en admin

- UI CRUD de tiquetes desde el panel de administración.
- Fix: ticket necesitaba type model; no permitir bajar la cantidad de tiquetes por debajo de los ya vendidos.
- Admin dashboard de bienvenida y lista de usuarios.
- Fix: toaster de Chakra no funcionaba, se cambia a Sonner.
- Fix: JWT super admin role en AuthProvider.

## 02/Jul/2026 — (sin cambios frontend)

## 03/Jul/2026 — Landing page de la convención

- Landing con temática de la convención.
- Agenda timeline y mejoras en navbar.
- Actualización de colores y background en login y registro.
- Perfil con nuevo esquema de colores; admin panel dark theme con overflow de tablas.

## 04/Jul/2026 — (sin cambios frontend)

## 05/Jul/2026 — SSR, refactors

- Pages con SSR y descomponer componente de encuestas (survey).
- Separar estado de UI en auth.
- Tickets y user table: separar componentes y usar memo.

## 06/Jul/2026 — Fix redirect + cleanup

- Fix: redirect para login y signup.
- Remover imágenes innecesarias.

## 07/Jul/2026 — (sin cambios frontend)

## 08/Jul/2026 — Vista previa de tiquetes

- Vista previa para tiquetes y eliminación de API de eventos.

## 09/Jul/2026 — (sin cambios frontend)

## 10/Jul/2026 — Assets, sliders, tickets list

- Comprimir assets.
- Slider básico en home + redes sociales oficiales de UTP y ASE.
- Remover archivos de features no implementadas (encuestas, eventos).
- UI lista de tickets (types) para todos los usuarios.
- UI ver y cambiar información personal.
- Fix: lista de roles no admitía admin; redirect por rol admin/client.

## 11/Jul/2026 — Entradas + QR + admin

- Mostrar entradas del usuario y permitir descargar el QR.
- Admin: modificar entradas, crear usuario desde la UI, cambiar información de usuario.
- Fix: admin repo upsert (auth trigger agrega usuario).
- Remover componentes y datos de encuestas (ya no se usan).
- Init: admin load excel user data.

## 12/Jul/2026 — Carga masiva desde Excel

- Creación masiva de usuarios desde archivos Excel cargado por admin.
- Tests de UI: schemas y componentes para manejo de usuarios por parte de admin.

## 13/Jul/2026 — Admin pagos + venta manual

- Page y componentes para admin enlistar y ver pagos.
- UI componentes para agregar compra manual de tickets desde admin.
- Fix: checkout admin usaba lista de entradas en vez de la BD.
- Refactor: refund con razón; lista de tickets no devuelve precio (usar el del pago).
- Payment maneja descuento, subtotal y total; snapshot de precio del ticket.
- Tests de componentes de estados refunded.

## 14/Jul/2026 — Carrito de compra + checkout

- Lógica del carrito de compra con localStorage.
- Drawer de carrito e ícono en navbar.
- Redirect a login al comprar.
- Checkout page y provider de carrito simplificado.
- Mercado Pago react: router para enviar a checkout.
- Fix: auto payment checkout no permitido; check de preference id.
- Refactor: usar format currency.

## 15/Jul/2026 — Landing rediseñada + admin UI + dashboard

- Landing page con animaciones, nuevas secciones y diseño.
- Panel admin nueva UI: welcome y tipos de entradas.
- Dashboard de usuario mejorado con sección resumen.
- Admin ve usuarios en modo tarjeta o tabla.
- UI para agregar ventas manuales desde admin.
- Fix: navbar section selected y skeleton para botones.

## 16/Jul/2026 — Refactors de UI

- Refactor: admin/pagos/:id nueva UI con modal central en reembolsos.
- Refactor: carga masiva de usuarios nueva UI.
- Refactor: /entradas nueva UI; drawer del carrito; checkout y mensajes de respuesta.
- Refactor: separar componentes y centrar contenido.
- Fix: tabla overflow break contenido en pantallas pequeñas.

## 17/Jul/2026 — (sin cambios frontend)

## 18/Jul/2026 — Fix: cart bloqueados

- Fix: /entradas permitía agregar tiquetes bloqueados.

## 19/Jul/2026 — (sin cambios frontend)

## 20/Jul/2026 — Checkin + QR scanner

- UI para checker: componentes y QR scanner.
- Nav y page para checker; proxy y lib para check de QR.
- Flujo de confirmación desde la UI.
- Fix: reembolso no debería eliminar tickets, solo pasarlos a cancelled.
- Estado de pago completed_unfulfillable en filtros y tarjetas.
- Permitir admins comprar y modificar su información; mejores mensajes de error.

## 21/Jul/2026 — Confirmar ticket usado

- Poder confirmar ticket usado desde dashboard de cliente.
- Email: agregar icono ASE.

## 22/Jul/2026 — Confirmación + HTML mail

- Página de confirmación por medio de link.
- HTML mail: enviar ticket id para ver información desde la cuenta.
- Test: modal de confirmación de la entrada.

## 23/Jul/2026 — Fix: prefix api/

- Fix: agregar /api/ como prefijo — frontend usaba endpoint inexistente para confirmaciones.

## 24/Jul/2026 — Init nueva UI

- Init nueva UI con colores y fuentes.
- Navbar transparente; navbar y hero aliados con Tailwind CSS.
- Sponsor: sección de impacto.

## 25/Jul/2026 — Sponsor sections

- Secciones sponsor: Visión, Impacto social, Beneficios, Asociación de Egresados, El futuro de la Universidad, Experiencias, Ubicación, footer.
- Sponsor: tarjetas reutilizables y sección de estar aquí.
- Refactor: navbar con glass effect y pop menu; remover tipo event nunca usado.
- Refactor: ticket section, cart, entradas y checkout.

## 26/Jul/2026 — Refactor UI

- Refactor: navbar sin boletín, about section, sección ¿Qué vas a vivir?, font colors de testimonios.
- Agregar efecto wave, animaciones de olas y partículas.
- UI auth: remover logo no oficial de la U, animar fondo, nuevo bg para login/registro.
- Fix: UI responsive; fix count en particles y param icon en layout.

## 27/Jul/2026 — Búsqueda usuarios + password + donar

- Buscar usuario por nombre, email y cédula; permitir cambiar cédula de usuario a null.
- Permitir el cambio de contraseña.
- No permitir refund cuando ya se ha usado un tiquete.
- Preguntar campos necesarios al usuario antes de la compra.
- Colores UTP y botón de compra en dashboard de usuario.
- Sección de invitados, aliados estratégicos, botones de donar, slider de fotos.
- Actualizar agenda oficial y imágenes oficiales.

## 28/Jul/2026 — Bloqueos + egresados

- Bloquear navegación si usuario no ha dado nombre y cédula.
- Bloquear tickets a no egresados en la UI; admin puede actualizar desde checkbox.
- Permitir al admin cambiar si un usuario es egresado y actualizar fecha de cierre de entrada.
- Fix: create checkout solo enviaba un URL — agregar post fijo success, failure, pending.
- Tests: verificar entradas bloqueadas a no egresados (mock de datos).

## 29/Jul/2026 — Donaciones ePayco

- Page, form y API para donaciones; copiar flujo de pagos para donaciones.
- ePayco: controller, route y service; CDN JS; método de pago en tabla y página de estado.
- Donaciones con ePayco checkout, bloquear MercadoPago.
- Fix: ePay no creaba checkout, necesita sessionId; no enviaba a URL redirect (mostraba pending).
- Permitir cambio de estado de donación; mostrar mensajes de error de ePayco.

## 30/Jul/2026 — Mapa de entradas + donaciones UI

- Mapa de entradas con selección de sección en el mapa del evento.
- Cargar zonas desde env; split ids de zonas del mapa desde env.
- Fix: alinear mapa, flex en card de entrada para evitar overflow; redondear porcentajes.
- Fix: react hidratation ePayco JS — cargarlo en SSR nextjs.
- Init donaciones API y config; admin donaciones CRUD.
- Fix: tabla de donaciones no convertía centavos.
- Logo Sonesta, número de WhatsApp ASE.

## 31/Jul/2026 — Estados de entrada + audit

- Agregar 3 estados para la entrada: habilitar, deshabilitar, bloqueado.
- Audit page para superadmin; audit logs en español.
- Mapa: mostrar en gris zonas sin entradas; mostrar mapa por defecto en vez de lista.
- Eliminar centro UTP y zona técnica del mapa; remover /entradas/mapa (solo toggle).
- Actualizar invitados: Checo Acosta, Alci Acosta, descripciones; imágenes del slider.
- Fix: hero small screens.
