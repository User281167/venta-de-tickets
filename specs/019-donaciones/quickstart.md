# Quickstart: Donaciones

## Overview

This feature adds donation functionality to the event ticketing platform, allowing users to make one-time donations to two different Mercado Pago accounts (La Convención and Barranqueros UTP) without requiring a user account.

## Prerequisites

Before starting implementation:

1. **Environment Variables**: Ensure these are set in your `.env` file:
   ```env
   # Existing (for La Convención - reuse or rename)
   MERCADOPAGO_ACCESS_TOKEN=<la-convencion-access-token>
   MERCADOPAGO_WEBHOOK_SECRET=<la-convencion-webhook-secret>
   
   # New (for Barranqueros UTP)
   MERCADOPAGO_BARRANQUEROS_UTP_ACCESS_TOKEN=<barranqueros-utp-access-token>
   MERCADOPAGO_BARRANQUEROS_UTP_WEBHOOK_SECRET=<barranqueros-utp-webhook-secret>
   
   # Required for both
   API_URL=<your-api-url>
   ```

2. **Mercado Pago Accounts**: 
   - Create two Mercado Pago accounts (or use existing)
   - Configure webhook URLs in each MP account dashboard:
     - La Convención: `https://<API_URL>/api/donaciones/webhook/mercadopago-la-convencion`
     - Barranqueros UTP: `https://<API_URL>/api/donaciones/webhook/mercadopago-barranqueros-utp`

3. **Database**: Run the donation migration (created in Phase 1)

## Setup Steps

### 1. Database Migration

```bash
# Add the Donation model to prisma/schema.prisma
# Then run:
npx prisma migrate dev --name add_donations
```

### 2. Backend Setup

```bash
# No additional dependencies needed (uses existing: mercadopago, zod, etc.)
```

### 3. Modify Payment Provider

Update `backend/src/modules/payments/providers/mercadopago.provider.ts`:
- Change constructor to accept config
- Update to use instance variables instead of global env

### 4. Register Providers

Update `backend/src/modules/payments/providers/provider.registry.ts`:
```typescript
import { env } from '../../../shared/config/env.js';

function registerKnownProviders() {
  // Existing
  registerProvider('mercadopago', new MercadoPagoProvider({
    accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
    webhookSecret: env.MERCADOPAGO_WEBHOOK_SECRET
  }));
  
  // New for donations
  registerProvider('mercadopago-la-convencion', new MercadoPagoProvider({
    accessToken: env.MERCADOPAGO_ACCESS_TOKEN, // or separate var
    webhookSecret: env.MERCADOPAGO_WEBHOOK_SECRET
  }));
  
  registerProvider('mercadopago-barranqueros-utp', new MercadoPagoProvider({
    accessToken: env.MERCADOPAGO_BARRANQUEROS_UTP_ACCESS_TOKEN,
    webhookSecret: env.MERCADOPAGO_BARRANQUEROS_UTP_WEBHOOK_SECRET
  }));
}
```

## Implementation Order

Follow this order for incremental delivery:

### Phase A: Backend Core (Can test with curl)
1. Add Donation model + enums to Prisma schema
2. Run migration
3. Create `donaciones.schema.ts` (Zod validation)
4. Create `donaciones.repository.ts` (Prisma queries)
5. Create `donaciones.service.ts` (business logic)
6. Create `donaciones.controller.ts` (route handlers)
7. Create `donaciones.routes.ts` (Express routes)
8. Register routes in main app

### Phase B: Webhook Setup (Can test with MP webhook simulator)
1. Verify webhook endpoints receive requests
2. Test signature verification
3. Test state updates
4. Test idempotency

### Phase C: Frontend (Can test end-to-end)
1. Create `DonationButton` component
2. Create `DonationForm` component with validation
3. Create return page with polling
4. Add buttons to landing page
5. Add TanStack Query mutation for donation creation

## Testing

### Backend Tests

```bash
# Unit tests for service
npm run test -- --filter donaciones.service

# Integration tests for webhook
npm run test -- --filter donaciones.webhook

# Full integration
npm run test -- --filter donaciones
```

### Frontend Tests

```bash
# Component tests
npm run test -- --filter DonationButton
npm run test -- --filter DonationForm

# E2E flow
npx playwright test donaciones.spec.ts
```

### Manual Testing

1. **Donation Flow**:
   - Open landing page
   - Click "Donar a La Convención"
   - Fill form: amount = 5000, name = "Test User", email = "test@example.com"
   - Submit → should redirect to Mercado Pago
   - Complete test payment (use MP sandbox)
   - Verify return page shows "confirmada"
   - Check database: state should be "confirmed"

2. **Anonymous Donation**:
   - Submit form without name
   - Verify database: full_name = null
   - Verify UI: displays "Anónimo"

3. **Minimum Amount**:
   - Try amount = 1000
   - Should show validation error

4. **Webhook Idempotency**:
   - Send same webhook payload twice
   - Second request should not change state

## Configuration Checklist

- [ ] Database migration applied
- [ ] Environment variables set for both accounts
- [ ] Mercado Pago webhook URLs configured
- [ ] Provider instances registered in registry
- [ ] CORS configured for frontend domain
- [ ] Rate limiting configured (optional)

## Troubleshooting

### Webhook Not Firing
- Verify webhook URL is correct in MP dashboard
- Check network connectivity (MP IPs must reach your server)
- Verify signature verification is working
- Check logs for errors (but not webhook payload - Ley 1581)

### Donation Stuck in Pending
- Check if webhook was received (look for metadata in DB)
- Verify payment was completed in MP dashboard
- Check if externalReference matches between preference and webhook

### Frontend Redirect Fails
- Verify init_point URL is returned from backend
- Check CORS headers
- Verify Mercado Pago sandbox vs production mode

## Rollback

If issues arise:
1. Database: Migration is additive (new table), safe to rollback
2. Code: Feature is isolated in `donaciones` module, can be disabled without affecting other features
3. Webhooks: Can be disabled in MP dashboard
