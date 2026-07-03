# Quickstart: Prisma Schema & Client Setup

**Phase**: 1 — Design & Contracts
**Date**: 2026-06-29

## Prerequisites

- Node.js 18+
- pnpm
- Supabase project with PostgreSQL database

## Setup Steps

### 1. Install Prisma

```bash
cd backend
pnpm add prisma @prisma/client
pnpm add -D prisma
```

### 2. Create .env

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres"
```

Replace with actual Supabase credentials from Project Settings → Database.

### 3. Write schema.prisma

Copy the schema from `data-model.md` to `backend/prisma/schema.prisma`.

### 4. Validate & Migrate

```bash
cd backend
npx prisma validate
npx prisma migrate dev --name init
```

### 5. Generate Client

```bash
npx prisma generate
```

### 6. Verify Client Singleton

```bash
npx ts-node src/shared/database/prisma.client.ts
```

Should connect and export the `prisma` instance without errors.

## Connection Configuration

| Env Variable | Purpose | Pooled |
|-------------|---------|--------|
| `DATABASE_URL` | Runtime queries (REST, GraphQL, etc.) | Yes (pgBouncer, port 6543) |
| `DIRECT_URL` | `prisma migrate`, `prisma db push` | No (direct, port 5432) |

## Verification Commands

```bash
# Schema check
npx prisma validate

# Generate migration
npx prisma migrate dev --name add_tables

# Generate client
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

## Common Issues

| Issue | Solution |
|-------|----------|
| `Error: Can't reach database server` | Check `.env` connection strings and Supabase project status |
| `Error: Database error` | Ensure `DIRECT_URL` uses port 5432 (not 6543) |
| `Error: relation already exists` | Run `prisma migrate dev` with a new migration name or use `prisma db push` |
| Pooled connection timeout | Add `?connection_limit=1` to `DATABASE_URL` |
