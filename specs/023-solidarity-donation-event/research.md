# Research: Reestructuración solidaria — La U del Futuro 2026

## 1. Reusar el flujo de donaciones existente

**Decision**: Mantener el flujo y los proveedores actuales de donación. No crear otra pasarela ni reemplazar los endpoints que ya funcionan. Aceptar nuevas donaciones públicas únicamente para UTPton. La landing usa actualmente el valor interno `VICTIMAS` para esta campaña; no ofrecer destinos de la Asociación de Egresados ni de Barranqueros.

**Rationale**: La donación ya opera con el módulo `donaciones`, formulario público, proveedores y retornos. La petición es reorientar la campaña existente, no introducir una transacción nueva.

**Alternatives considered**: Integrar otro proveedor o crear otro flujo de pago. Rechazadas porque la donación actual funciona y no se solicitó una pasarela nueva.

## 2. Mantener el contador y la meta editables desde administración

**Decision**: Conservar el contador público y la edición administrativa de `currentValue` y `metaValue`; mantener su incremento automático al confirmarse donaciones. No reemplazarlo por cifras estáticas ni quitar el control desde admin.

**Rationale**: El sistema ya expone `GET /api/donaciones/counter`, actualiza el contador al confirmar aportes y ofrece el modal administrativo de ajuste mediante `PUT /api/admin/donations/counter`. La meta se puede ajustar desde el panel.

**Alternatives considered**: Eliminar el contador, congelar la meta en el frontend o crear una meta nueva. Rechazadas porque el contador y la edición desde admin ya se usan.

## 3. Deshabilitar APIs del flujo anterior en Express

**Decision**: Desactivar los endpoints de negocio para compra/venta de entradas, pagos de entradas, usuarios regulares, cuenta personal, confirmación y check-in. Mantener operativos los endpoints de donación y el mínimo de endpoints de autenticación/personal y administración de donaciones requeridos para que el admin pueda ingresar y ajustar/consultar el contador.

**Rationale**: Ocultar páginas en el frontend no bloquea solicitudes directas a la API. El usuario pidió apagar en Express los endpoints del modelo de entradas; al mismo tiempo, el admin y la meta del contador deben seguir funcionando.

**Alternatives considered**: Desmontar toda la API salvo `/api/donaciones`. Rechazada porque rompería inicio de sesión del personal y el endpoint de administración que guarda la meta/contador. Las excepciones quedan delimitadas a autenticación/sesión de staff, identidad administrativa y operaciones admin de donaciones.

## 4. Allowlist de API que permanece operativa

**Decision**: Mantener `/api/donaciones` (crear donación, webhook del proveedor, estado y contador público), autenticación/sesión de staff, `GET /api/admin/me`, `GET /api/admin/donations` y `PUT /api/admin/donations/counter`, todos con las verificaciones actuales o más restrictivas de firma y rol.

**Rationale**: Son las rutas necesarias para completar/confirmar donaciones, mostrar el contador, permitir el acceso administrativo y editar la meta/valor del contador. El resto de la gestión administrativa ligada a entradas no pertenece a la nueva operación.

**Alternatives considered**: Dejar todos los endpoints admin activos por el hecho de conservar el inicio del admin. Rechazada porque mantiene operativas funciones de entradas/pagos/usuarios que ya no forman parte del evento.

**Endpoint behavior detail**: `POST /api/donaciones` must validate the UTPton campaign account server-side, so direct HTTP calls cannot still create donations for old recipient accounts. Existing stored records remain intact. Keep current provider callbacks needed to settle already-created donations.

## 5. Identidad y recursos

**Decision**: Usar los logos y piezas existentes en `frontend/public/assets/utpton/`, seleccionando las variantes según fondo y propósito. Conservar solo mensajes y destino de donación de UTPton.

**Rationale**: Los recursos fueron suministrados para esta campaña y permiten reorientar la portada sin recurrir a otra identidad visual.

## 6. Agenda y fecha fuente

**Decision**: Presentar la jornada del sábado 24 de octubre de 2026. Mantener como tentativas las modalidades marcadas para evaluación/recomendación y no publicar artistas como confirmados sin aprobación.

**Rationale**: El programa escrito define una sola jornada el 24 de octubre; la referencia de imagen a los días 22 y 23 pertenece al planteamiento anterior.

## 7. Persistencia

**Decision**: No agregar tablas ni cambiar los estados/datos financieros de donaciones. Reutilizar la entidad existente del contador, incluidos valor recaudado y meta ajustable desde admin. Mantener registros históricos de donación sin reclasificarlos como aportes de otra campaña.

**Rationale**: El flujo, su contador y el panel de administración ya existen. La nueva agenda es contenido editorial y no requiere un modelo de eventos.
