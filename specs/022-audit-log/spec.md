# Feature Specification: Módulo de Auditoría

**Feature Branch**: `022-audit-log`

**Created**: 2026-07-31

**Status**: Draft

**Input**: Módulo de auditoría que registra acciones de mutación ejecutadas por roles staff sobre entidades del negocio y las expone de solo lectura a roles autorizados, vía panel con actualización automática.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registro automático de acciones de personal (Priority: P1)

Cuando un miembro del personal (`admin`, `checker`) modifica una entidad del negocio (tipo de ticket, ticket, pago, código de descuento), el sistema registra automáticamente el hecho: quién lo hizo, su rol en ese momento, cuándo, sobre qué entidad y qué cambió.

**Why this priority**: Es la base de todo el módulo; sin registro no hay auditoría que mostrar.

**Independent Test**: Un cambio de precio en un tipo de ticket genera un registro de auditoría visible para un usuario autorizado, con datos correctos de actor, momento y valores antes/después.

**Acceptance Scenarios**:

1. **Given** un `admin` autenticado, **When** cambia el precio de un tipo de ticket, **Then** queda un registro con su identidad, su rol, la fecha/hora, la entidad y los valores de precio anterior y nuevo.
2. **Given** un `checker` autenticado, **When** realiza check-in de un ticket, **Then** queda un registro de auditoría de la acción.
3. **Given** una acción de mutación no contemplada en la lista base, **When** el personal la ejecuta, **Then** no se genera registro (solo se auditan las acciones definidas).

---

### User Story 2 - Consulta de auditoría desde el panel de `super_admin` (Priority: P1)

El usuario con rol `super_admin` consulta en su propio panel el historial de acciones del personal, sin poder ejecutar mutaciones desde ese panel. El panel se actualiza automáticamente cada pocos segundos, sin recargar la página.

**Why this priority**: Es el caso de uso guía: el `super_admin` vigila cambios de precios desde su panel.

**Independent Test**: Tras un cambio de precio ejecutado por `admin`, el panel del `super_admin` muestra el cambio en menos de 5 segundos sin recarga manual.

**Acceptance Scenarios**:

1. **Given** un cambio de precio recién ejecutado por `admin`, **When** el `super_admin` tiene su panel abierto, **Then** el cambio aparece en la tabla en un plazo de ~5 segundos sin recargar la página.
2. **Given** el panel abierto, **When** el `super_admin` navega por los registros, **Then** la tabla muestra: cuándo, quién, rol, acción, entidad y resumen del cambio, y permite paginar.
3. **Given** la tabla, **When** el `super_admin` quiere ver solo un tipo de entidad (p. ej. solo pagos), **Then** puede filtrar por entidad sin cambiar de vista.

---

### User Story 3 - Restricción de acceso y separación de mutación (Priority: P2)

Solo `super_admin` puede leer la auditoría, y el panel de auditoría no ofrece ninguna acción de mutación: es estrictamente de consulta.

**Why this priority**: Garantiza integridad del registro; un panel de solo lectura evita alteraciones accidentales del historial y mantiene la auditoría como fuente confiable de control.

**Independent Test**: Un usuario sin rol `super_admin` recibe negado el acceso al historial, y el panel de auditoría no expone ninguna operación de escritura.

**Acceptance Scenarios**:

1. **Given** un usuario con rol distinto de `super_admin` (p. ej. `admin` o `checker`), **When** intenta abrir el historial de auditoría, **Then** el acceso es denegado.
2. **Given** el panel de auditoría abierto por `super_admin`, **When** se revisan las operaciones disponibles, **Then** ninguna es de mutación (no se puede crear, editar ni eliminar desde el panel).
3. **Given** el rol `super_admin`, **When** se usan los demás paneles administrativos, **Then** conserva sus permisos de mutación actuales (la restricción de solo lectura aplica únicamente al panel de auditoría).

---

### User Story 4 - Privacidad en los detalles registrados (Priority: P2)

Los detalles del cambio (`metadata`) contienen solo la información mínima necesaria, sin datos personales de compradores, salvo los casos donde la acción es directamente sobre ese dato.

**Why this priority**: Cumplimiento de la ley colombiana de protección de datos (Ley 1581); filtrar PII innecesaria.

**Independent Test**: Revisión de los registros generados por las acciones del MVP confirma ausencia de datos personales de compradores fuera de las excepciones definidas.

**Acceptance Scenarios**:

1. **Given** un cambio de precio, **When** se genera el registro, **Then** el detalle contiene solo los valores de precio anterior y nuevo, no el objeto completo de la entidad.
2. **Given** un check-in, **When** se genera el registro, **Then** el detalle solo incluye identificación del comprador si la acción de check-in lo requiere para confirmar identidad.
3. **Given** cualquier registro de auditoría, **When** se inspecciona su contenido, **Then** no contiene nombres, correos ni documentos de compradores fuera de los casos anteriores.

---

### Edge Cases

- ¿Qué ocurre si el registro de auditoría falla justo después de una mutación exitosa? La operación principal debe completarse igual; el error no revierte ni bloquea la transacción.
- ¿Qué ocurre si el usuario que ejecutó la acción ya no existe o cambió de rol? El registro conserva el rol y la identidad del momento del hecho.
- ¿Qué ocurre cuando la auditoría no tiene registros? El panel muestra estado vacío, sin errores.
- ¿Qué ocurre si hay más registros de los que caben en una página? Se permite paginar; los registros nuevos se muestran en orden cronológico.
- ¿Qué ocurre con registros de entidades ya eliminadas? El historial los conserva y los sigue mostrando.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST registrar automáticamente las siguientes acciones de mutación: creación de tipo de ticket, cambio de precio de tipo de ticket, activación/desactivación de tipo de ticket, cancelación de ticket, check-in de ticket, cambio de estado de pago (incluyendo transacciones administrativas), creación de código de descuento y desactivación de código de descuento.
- **FR-002**: Cada registro MUST capturar: quién ejecutó la acción (identidad y rol en el momento del hecho), cuándo, sobre qué entidad, y un detalle selectivo de lo que cambió.
- **FR-003**: El usuario `super_admin` MUST poder consultar el historial en orden cronológico, con opción de filtrar por entidad y de paginar.
- **FR-004**: El panel del `super_admin` MUST actualizarse automáticamente cada pocos segundos (3–5 s), sin recarga manual de la página.
- **FR-005**: El acceso al historial MUST estar restringido exclusivamente al rol `super_admin`; los demás roles reciben acceso denegado.
- **FR-006**: El panel de auditoría MUST ser estrictamente de solo lectura: no expone ninguna acción de mutación (crear, editar, eliminar). El rol `super_admin` conserva sus permisos de mutación en los demás paneles.
- **FR-007**: El detalle del registro (`metadata`) MUST contener solo la información mínima del cambio, sin datos personales de compradores (nombre, correo, documento), salvo en acciones cuyo propósito sea confirmar identidad (ej. check-in).
- **FR-008**: Registrar una acción nueva en el futuro MUST NO requerir cambios estructurales; basta con definir la nueva acción.
- **FR-009**: El fallo en el registro de auditoría MUST NOT afectar ni revertir la operación principal que lo originó.
- **FR-010**: El sistema MUST NO auditar las operaciones de lectura (consultas no generan registros).

### Key Entities *(include if feature involves data)*

- **Registro de auditoría**: Representa un hecho ejecutado por un usuario del personal sobre una entidad del negocio. Contiene: identidad y rol del actor (del momento del hecho), tipo y fecha del evento, entidad afectada y su identificador, y detalle selectivo del cambio.
- **Evento**: Contexto al que pertenece la entidad afectada; los registros quedan asociados al evento activo.
- **Usuario (actor)**: Persona del personal que ejecuta la acción; el registro conserva una copia de su rol al momento del hecho.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un cambio de precio ejecutado por `admin` aparece en el panel del `super_admin` en un plazo de ~5 segundos sin recarga manual de página.
- **SC-002**: 100% de los accesos al historial desde roles distintos de `super_admin` son denegados, y el panel de auditoría no expone ninguna acción de mutación.
- **SC-003**: 100% de los registros de auditoría de las acciones del MVP cumplen la regla de privacidad (sin datos personales de compradores fuera de las excepciones definidas).
- **SC-004**: Incorporar una nueva acción auditable no requiere cambios estructurales del sistema (solo definir la nueva acción).
- **SC-005**: La ejecución de las mutaciones del negocio no se ve afectada por errores en el registro de auditoría (cero interrupciones de operaciones por fallos de auditoría).

## Assumptions

- Existe un evento activo único al que se asocian los registros.
- Los roles del sistema son los actuales: `admin`, `super_admin`, `checker`, `client`. Solo `super_admin` lee el historial; los demás roles no tienen acceso.
- El rol `super_admin` conserva sus permisos de mutación actuales; la restricción de solo lectura aplica únicamente al panel de auditoría.
- El volumen de registros es bajo (evento único, ~2000 asistentes, pocos administradores); no se requiere archivo ni particionamiento.
- No hay política de retención ni purga automática en el MVP; la pregunta de conservación según Ley 1581 queda abierta para una fase posterior.
- El registro de auditoría es no bloqueante: si falla, se ignora sin afectar la operación principal.
- Los datos personales de compradores nunca se registran, salvo confirmación de identidad en check-in.
