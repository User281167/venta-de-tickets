# Quickstart: User Profile Panel

## Prerequisites

- Branch: `004-user-profile-panel` — already checked out
- Backend dependencies installed: `pnpm install` in `backend/`
- Prisma client generated: `cd backend && pnpm exec prisma generate`
- Supabase DB running with `users` and `privacy_acceptances` tables
- Auth middleware working (003-express-auth-middleware)
- `.env` file with `SUPABASE_JWT_SECRET`, `DATABASE_URL`, `PORT`

## Backend

### Files to create

```
backend/src/modules/users/
├── users.validators.ts
├── users.repository.ts
├── users.service.ts
├── users.controller.ts
├── users.routes.ts
├── users.types.ts
└── index.ts
```

### Backend setup

```bash
cd backend
pnpm test
```

### Tests

```bash
# Unit tests for service layer
pnpm test
```

## Frontend

### Files to create

```
frontend/src/features/users/
├── components/
│   ├── ProfileForm.tsx
│   └── PrivacyConsentModal.tsx
├── hooks/
│   └── useProfile.ts
├── api/
│   ├── users.queries.ts
│   └── users.endpoints.ts
├── schemas/
│   └── users.schema.ts
└── index.ts

frontend/src/app/mi-cuenta/
└── page.tsx
```

### Frontend setup

```bash
cd frontend
pnpm dev
```

Visit `http://localhost:3000/mi-cuenta` to test.

## Verification Checklist

- [ ] Authenticated user sees profile data on `/mi-cuenta`
- [ ] Edit + save updates persist on reload
- [ ] Consent modal blocks access until accepted
- [ ] Already-consented user sees panel directly
- [ ] `email`/`id` edit rejected with error
- [ ] Unauthenticated → redirected to login (401)
- [ ] `ipAddress` logged from server (not client)
- [ ] Duplicate consent call returns existing record
