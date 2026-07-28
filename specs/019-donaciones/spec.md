# Feature Specification: Donaciones

**Feature Branch**: `019-donaciones`

**Created**: 2026-07-28

**Status**: Draft

**Input**: User description: "Implementar sistema de donaciones con Mercado Pago para dos cuentas independientes (La convención y Barranqueros UTP), sin requerir cuenta de usuario, con seguimiento de estado vía webhook y página de retorno con polling."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Donar a La Convención (Priority: P1)

Usuario accede a landing, selecciona botón "Donar a La Convención", completa formulario con nombre opcional, email opcional y monto mínimo 2000 COP, envía formulario y es redirigido a Mercado Pago para completar pago. Tras pago, ve página de retorno con estado confirmado.

**Why this priority**: Core functionality. Sin esto, no hay donaciones.

**Independent Test**: Puede probarse con un pago de prueba en MP. Entrega valor completo: usuario puede donar a una cuenta.

**Acceptance Scenarios**:

1. **Given** usuario en landing, **When** hace clic en "Donar a La Convención", **Then** ve formulario de donación
2. **Given** formulario con monto 2000, **When** envía, **Then** redirige a init_point de MP
3. **Given** pago completado en MP, **When** usuario regresa, **Then** ve estado "confirmada" en página de retorno
4. **Given** pago fallido en MP, **When** usuario regresa, **Then** ve estado "rechazada" o "cancelada"

---

### User Story 2 - Donar a Barranqueros UTP (Priority: P1)

Usuario accede a landing, selecciona botón "Donar a Barranqueros UTP", completa formulario idéntico al de La Convención, envía y es redirigido a MP con credenciales de Barranqueros UTP.

**Why this priority**: P1 porque es la segunda cuenta requerida. Mismo valor que US1.

**Independent Test**: Puede probarse independientemente con credenciales de Barranqueros UTP.

**Acceptance Scenarios**:

1. **Given** usuario en landing, **When** hace clic en "Donar a Barranqueros UTP", **Then** ve formulario de donación
2. **Given** formulario completado, **When** envía, **Then** redirige a init_point de MP con cuenta correcta
3. **Given** pago completado, **Then** webhook actualiza estado a "confirmada" en BD

---

### User Story 3 - Webhook Processing (Priority: P1)

Mercado Pago envía notificación de pago a endpoint de webhook específico por cuenta. Backend procesa notificación, actualiza estado de donación y guarda metadata.

**Why this priority**: Sin webhook, no hay confirmación automática de pagos.

**Independent Test**: Puede probarse con notificaciones de prueba de MP.

**Acceptance Scenarios**:

1. **Given** notificación de pago confirmado, **When** webhook recibe request, **Then** actualiza estado a "confirmada" en BD
2. **Given** notificación de pago rechazado, **When** webhook recibe request, **Then** actualiza estado a "rechazada"
3. **Given** notificación duplicada, **When** webhook recibe request, **Then** ignora (idempotencia)
4. **Given** notificación con externalReference no encontrado, **When** webhook recibe request, **Then** devuelve 404

---

### User Story 4 - Polling de Estado (Priority: P2)

Usuario en página de retorno hace polling corto al endpoint de status para ver actualización de estado en tiempo real.

**Why this priority**: P2 porque es mejora de UX. Sin esto, usuario debe recargar manualmente.

**Independent Test**: Puede probarse con endpoint de status funcionando.

**Acceptance Scenarios**:

1. **Given** externalReference válido, **When** GET /status, **Then** devuelve estado actual
2. **Given** externalReference inválido, **When** GET /status, **Then** devuelve 404

---

### Edge Cases

- Monto menor a 2000 COP: validación en frontend y backend, error claro
- Nombre vacío: guarda null en BD, muestra "Anónimo" en UI
- Email inválido: acepta cualquier string (no validación de formato)
- Webhook con payload malformado: guarda en metadata, devuelve 400
- Pago en MP pero usuario cierra navegador antes de retorno: estado se actualiza vía webhook, usuario puede verificar después con externalReference
- Concurrentes: múltiples donaciones simultáneas no interfieren

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow anonymous donations without user account
- **FR-002**: System MUST support two independent Mercado Pago accounts (LA_CONVENCION, BARRANQUEROS_UTP)
- **FR-003**: System MUST validate donation amount is at least 2000 COP (integer, in cents)
- **FR-004**: System MUST generate unique externalReference in format `DON-{account}-{uuid}` for each donation
- **FR-005**: System MUST create Mercado Pago preference with explicit notification_url per account
- **FR-006**: System MUST handle webhook notifications for both accounts on separate endpoints
- **FR-007**: System MUST update donation state via webhook with idempotency (only if current state is pending)
- **FR-008**: System MUST store raw webhook payload in metadata field for audit
- **FR-009**: System MUST NOT log webhook payload outside metadata field (Ley 1581 compliance)
- **FR-010**: System MUST provide status endpoint for polling by externalReference
- **FR-011**: System MUST display "Anónimo" when full_name is null in presentation layers
- **FR-012**: System MUST accept optional email without uniqueness validation
- **FR-013**: Frontend MUST have two separate "Donar" buttons, one per account
- **FR-014**: Frontend MUST redirect to Mercado Pago init_point after form submission
- **FR-015**: Frontend MUST show donation status (pending/confirmed/rejected/cancelled) on return page

### Key Entities *(include if feature involves data)*

- **Donation**: Represents a donation transaction. Attributes: id (UUID), full_name (nullable string), email (nullable string), amountCents (Decimal, min 2000), state (pending/confirmed/rejected/cancelled), account (LA_CONVENCION/BARRANQUEROS_UTP), externalReference (unique string), paymentId (nullable string from MP), metadata (JSON for webhook payload), createdAt, updatedAt
- **DonationAccount**: Enum with two values representing the target Mercado Pago accounts
- **DonationStatus**: Enum representing donation lifecycle states

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a donation in under 3 minutes from landing to confirmation
- **SC-002**: 100% of webhook notifications are processed successfully (idempotent)
- **SC-003**: 100% of donations have unique externalReference that can be queried
- **SC-004**: System handles 100 concurrent donation requests without errors
- **SC-005**: Status polling returns accurate state within 5 seconds of webhook processing
- **SC-006**: 0% of webhook payloads are logged outside metadata field (compliance)

## Assumptions

- Mercado Pago credentials for both accounts are available in environment variables
- Existing MercadoPagoProvider can be reused or extended for donation preferences
- Frontend uses existing UI components and styling patterns
- Backend uses existing Prisma setup and database connection
- Webhook endpoints are publicly accessible to Mercado Pago
- Polling interval on return page is short (2-5 seconds) for good UX
- Donations are one-time only (recurring donations are out of scope)
- No tax receipts are generated (out of scope)
- No fundraising goals or progress tracking (out of scope)
