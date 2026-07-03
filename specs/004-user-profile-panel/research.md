# Research: User Profile Panel

**Phase**: 0 — Outline & Research
**Date**: 2026-06-30

## 1. Editable Fields on Users Table

**Decision**: Allowlist = fullName, phone only

**Rationale**: The existing `users` table schema (001-prisma-schema-setup) defines only these mutable fields. The spec's mention of "academic program" and "document ID" are forward-looking assumptions not reflected in the actual schema. Keeping the allowlist minimal avoids scope creep and schema drift.

**Alternatives considered**:
- Add `academicProgram` and `documentId` columns now — rejected as premature; no current requirement beyond this panel
- Use a blacklist approach — rejected in favor of explicit allowlist (security best practice: reject unknown fields by default)

## 2. IP Address Extraction

**Decision**: Read from `req.ip` (Express), which respects `trust proxy` setting. In production (Railway behind proxy), trust `x-forwarded-for`.

**Rationale**: Express's built-in `req.ip` returns the client IP when `trust proxy` is enabled. Railway uses a proxy, so `app.set('trust proxy', true)` must be set in `app.ts`. Never trust `req.body.ipAddress` from client.

**Alternatives considered**:
- Third-party `request-ip` library — unnecessary; Express built-in covers the need with `trust proxy`
- Client-side detection — rejected; IP must be server-detected per FR-006

## 3. Policy Version Strategy

**Decision**: Hardcoded constant `PRIVACY_POLICY_VERSION = '1.0.0'` in backend code for v1.

**Rationale**: Single active policy version at any time. A constant is the simplest choice that satisfies Ley 1581 requirements. Adding a DB-backed version system is premature until multiple versions need to coexist (e.g., when policy text is updated and existing users must re-consent).

**Alternatives considered**:
- DB table with active version — rejected; adds complexity with no current need
- Environment variable — rejected; version is a business constant, not deployment config

## 4. Consent Check Strategy

**Decision**: `GET /api/users/me` response includes a `consentStatus` field: `{ required: boolean, acceptedAt: string | null, policyVersion: string }`.

**Rationale**: Single query to determine if consent modal should show. The frontend checks `consentStatus.required && !consentStatus.acceptedAt` to gate the profile panel. No separate consent-check endpoint needed.

**Alternatives considered**:
- Separate `GET /api/users/me/privacy-status` endpoint — rejected; adds an extra request on page load
- Frontend-only check via localStorage — rejected; consent must be server-recorded for compliance

## 5. Privacy Acceptance Idempotency

**Decision**: `POST /api/users/me/privacy-acceptance` checks for existing acceptance for the same user + policy version + policy type. If found, returns existing record (200) instead of creating a duplicate (409 or 201).

**Rationale**: Safe for users who accidentally double-click or refresh after accepting. Prevents duplicate rows.

**Alternatives considered**:
- Return 409 Conflict — rejected; penalizes legitimate double-submit scenarios
- Use upsert with unique constraint on (userId, policyVersion, policyType) — possible but Prisma upsert on a non-unique column set is not supported without a composite unique constraint
- Always insert — rejected; creates noisy duplicate rows

## 6. Express `trust proxy` Setting

**Decision**: Add `app.set('trust proxy', 1)` to `backend/src/app.ts`.

**Rationale**: Required for `req.ip` to return the real client IP when behind Railway's proxy. Without it, `req.ip` returns the proxy IP.

**Alternatives considered**:
- `app.set('trust proxy', 'loopback')` — too restrictive if Railway uses different internal IPs
- Parse `x-forwarded-for` manually — rejected; Express handles it correctly when `trust proxy` is set
