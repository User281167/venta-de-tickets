# Quickstart: Express Auth Middleware

## Prerequisites

- Node.js >= 20
- pnpm >= 10
- Backend dependencies installed: `cd backend && pnpm install`
- Supabase project running with `SUPABASE_JWT_SECRET` known

## Setup

```bash
# Navigate to backend
cd backend

# Install new dependency
pnpm add jsonwebtoken
pnpm add -D @types/jsonwebtoken

# Make sure Prisma client is generated
pnpm prisma generate
```

## Environment

Add to `backend/.env` (or create `backend/.env` if missing):

```env
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
DATABASE_URL=postgresql://...
PORT=3001
```

## Development

```bash
# Start dev server with hot reload
pnpm dev
```

The server starts on `http://localhost:3001`.

## Test Routes

Once middlewares are wired:

```bash
# Protected route (no auth → 401)
curl http://localhost:3001/api/me

# Protected route (valid token → 200 + user)
curl -H "Authorization: Bearer <valid-jwt>" http://localhost:3001/api/me

# Admin route (valid token, non-admin → 403)
curl -H "Authorization: Bearer <user-jwt>" http://localhost:3001/api/admin/ping

# Admin route (valid admin token → 200)
curl -H "Authorization: Bearer <admin-jwt>" http://localhost:3001/api/admin/ping
```

## Verification Checklist

- [ ] Missing auth header → 401
- [ ] Expired JWT → 401
- [ ] Tampered JWT → 401
- [ ] Valid user JWT → 200 + `req.user.id` matches JWT `sub`
- [ ] Valid user JWT on admin route → 403
- [ ] Valid admin JWT on admin route → 200
- [ ] No network calls to Supabase Auth during any of the above
