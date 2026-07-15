# Quickstart: Interfaz moderna para landing y dashboard

## Prerequisites

- Node.js 20+ and pnpm 11+
- Backend running on `http://localhost:3001` (or set `NEXT_PUBLIC_API_URL`)
- Supabase project configured (env vars already in `frontend/.env.local`)

## Install dependencies

```bash
cd frontend
pnpm install
```

## Run development server

```bash
pnpm dev
```

The frontend will be available at `http://localhost:3000`.

## Verify the feature

1. **Landing page**:
   - Open `http://localhost:3000/`.
   - Confirm the hero, event/ticket section, and CTAs render.
   - Hover over cards and buttons; confirm transitions are smooth.
   - Resize to mobile width; confirm no horizontal scroll.

2. **Dashboard**:
   - Log in with a test user.
   - Navigate to `http://localhost:3000/mi-cuenta`.
   - Confirm the dashboard overview shows:
     - Active tickets count
     - Recent payments
     - Profile completion status
     - Links to `/mi-cuenta/entradas` and `/mi-cuenta/pagos`
   - Test empty state with a fresh user account.
   - Test loading state by throttling network.

3. **Accessibility**:
   - Enable `prefers-reduced-motion` in OS/browser settings.
   - Confirm animations are disabled or replaced with instant transitions.
   - Tab through interactive elements; focus states must be visible.

## Run tests

```bash
cd frontend
pnpm test
```

Add new component tests under the relevant `features/<domain>/components/__tests__/` folder.

## Build

```bash
cd frontend
pnpm build
```

Ensure no TypeScript or ESLint errors before committing.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
