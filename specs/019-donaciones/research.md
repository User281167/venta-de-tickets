# Research: Donaciones Implementation

## Decisions

### 1. Payment Provider Architecture

**Decision**: Reuse existing `PaymentProvider` interface and `MercadoPagoProvider` class. Modify `MercadoPagoProvider` to accept configuration in constructor instead of reading from global env.

**Rationale**: 
- Existing interface already has all required methods (createCheckout, verifySignature, parseWebhook)
- Registry pattern already supports multiple provider instances
- Minimal change: only need to make constructor configurable
- Avoids creating new provider class, maintains consistency

**Alternatives considered**:
- Create new `DonationMercadoPagoProvider` subclass: Unnecessary duplication
- Use separate provider type for donations: Violates DRY, same functionality

**Implementation**:
```typescript
// Modified constructor
constructor(private config: { accessToken: string; webhookSecret: string }) {}

// Registry registration
registerProvider('mercadopago-la-convencion', new MercadoPagoProvider({
  accessToken: env.MERCADOPAGO_LA_CONVENCION_ACCESS_TOKEN,
  webhookSecret: env.MERCADOPAGO_LA_CONVENCION_WEBHOOK_SECRET
}));

registerProvider('mercadopago-barranqueros-utp', new MercadoPagoProvider({
  accessToken: env.MERCADOPAGO_BARRANQUEROS_UTP_ACCESS_TOKEN,
  webhookSecret: env.MERCADOPAGO_BARRANQUEROS_UTP_WEBHOOK_SECRET
}));
```

---

### 2. Environment Variables

**Decision**: Add 4 new environment variables for the second Mercado Pago account:
- `MERCADOPAGO_BARRANQUEROS_UTP_ACCESS_TOKEN`
- `MERCADOPAGO_BARRANQUEROS_UTP_WEBHOOK_SECRET`

**Rationale**: 
- Existing account keeps using `MERCADOPAGO_ACCESS_TOKEN` and `MERCADOPAGO_WEBHOOK_SECRET`
- Clear separation between accounts
- Follows existing naming convention

**Alternatives considered**:
- Single set of env vars with account prefix: More complex, requires runtime resolution
- Config file: Overkill for 2 accounts

---

### 3. Webhook Endpoints

**Decision**: Create 2 separate webhook endpoints:
- `POST /api/donaciones/webhook/mercadopago-la-convencion`
- `POST /api/donaciones/webhook/mercadopago-barranqueros-utp`

**Rationale**:
- Mercado Pago requires explicit notification_url per preference
- Separate endpoints allow different credentials for signature verification
- Single service method handles both: `handleWebhook(account, payload)`
- Route handlers are thin, delegate to service

**Alternatives considered**:
- Single webhook endpoint with account in path param: `/api/donaciones/webhook/mercadopago/:account` - Rejected because MP webhook URL must be static (configured in MP panel)
- Single endpoint with account in body: Less RESTful, harder to secure

---

### 4. Donation Model vs Payment Model

**Decision**: Create new `Donation` model, separate from existing `Payment` model.

**Rationale**:
- Donations have different lifecycle (no tickets, no user required)
- Different data: no ticketTypeId, no userId, has account enum
- Different business rules: anonymous allowed, no inventory management
- Existing Payment model is for ticket purchases, tightly coupled to tickets

**Alternatives considered**:
- Extend Payment model with nullable fields: Would pollute payment logic, violate single responsibility
- Use Payment model with type discriminator: Complex queries, confusing business logic

---

### 5. Frontend Form Validation

**Decision**: Use Zod schema in both frontend and backend for donation validation.

**Rationale**:
- Existing pattern in codebase (Zod for validation both ends)
- Schema: `amountCents` (number, min 2000), `fullName` (string, optional), `email` (string, optional, .email())
- Shared schema can be defined in backend and imported by frontend via API types

**Alternatives considered**:
- Frontend-only validation: Inconsistent, backend still needs validation
- Different schemas: Maintenance burden, potential drift

---

### 6. Idempotency Pattern

**Decision**: Use same pattern as existing payments module: `UPDATE ... WHERE state = 'pending'` and check `affected rows`.

**Rationale**:
- Already proven in codebase
- Protects against duplicate webhook notifications
- Simple, effective, no additional infrastructure needed

**Implementation**:
```typescript
const result = await prisma.donation.updateMany({
  where: { externalReference, state: 'pending' },
  data: { state: newState, paymentId, metadata: webhookPayload }
});

if (result.count === 0) {
  // Already processed or invalid state, skip
  return;
}
```

---

### 7. External Reference Format

**Decision**: `DON-{account}-{uuid}` where account is `LA_CONVENCION` or `BARRANQUEROS_UTP`

**Rationale**:
- Spec requirement
- Allows easy filtering by account
- UUID ensures uniqueness
- Prefix `DON` distinguishes from other reference types

---

### 8. Status Polling

**Decision**: Short polling (2-3 seconds) from frontend to `GET /api/donaciones/:externalReference/status`

**Rationale**:
- Good UX for return page
- Donations typically confirm within 10-30 seconds
- No WebSocket infrastructure needed
- Simple to implement

**Alternatives considered**:
- Server-Sent Events: More complex, not needed for this volume
- WebSockets: Overkill, connection management overhead

---

### 9. Ley 1581 Compliance

**Decision**: Store raw webhook payload only in `metadata` JSONB field. Do NOT log to application logs.

**Rationale**:
- Spec requirement
- Metadata field is for audit, persists with donation record
- Application logs may be retained longer, accessed by more people
- JSONB allows querying if needed for compliance audits

---

### 10. Anonymous Donations

**Decision**: `fullName` is nullable in DB. Frontend displays "Anónimo" when null.

**Rationale**:
- Spec requirement
- No fake data in database
- Presentation concern handled in UI layer
- Consistent with privacy principles (don't store what you don't need)
