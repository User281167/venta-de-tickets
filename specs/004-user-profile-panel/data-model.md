# Data Model: User Profile Panel

**Phase**: 1 — Design & Contracts
**Date**: 2026-06-30

## Entities

### User (existing — 001-prisma-schema-setup)

| Field | Type | Editable via Profile? | Notes |
|-------|------|-----------------------|-------|
| id | UUID (PK) | Never | Set by Supabase Auth trigger |
| fullName | String(150) | Yes | |
| email | String(255) | Never | Managed by Supabase Auth |
| phone | String(20)? | Yes | |
| isActive | Boolean | No | System-managed |
| createdAt | Timestamptz | No | Read-only audit |
| updatedAt | Timestamptz | No | Auto-updated |

### PrivacyAcceptance (existing — 001-prisma-schema-setup)

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| id | UUID (PK) | Auto-generated | |
| userId | UUID (FK → users.id) | From auth middleware (req.user.id) | |
| policyVersion | String(20) | Constant `PRIVACY_POLICY_VERSION` in code | |
| policyType | PolicyType enum | Always `privacy_policy` for this feature | |
| acceptedAt | Timestamptz | Server timestamp | |
| ipAddress | String (Inet) | From `req.ip` with `trust proxy` | Server-detected, never from client |
| userAgent | String | From `req.headers['user-agent']` | |

## API Contracts

### GET /api/users/me

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Juan Pérez",
    "phone": "+573001234567"
  },
  "consentStatus": {
    "required": true,
    "acceptedAt": "2026-06-30T10:00:00Z",
    "policyVersion": "1.0.0"
  }
}
```

### PATCH /api/users/me

Request (all fields optional):
```json
{
  "fullName": "Juan Pérez",
  "phone": "+573001234567"
}
```

Validation rules:
- `fullName`: string, 1-150 chars, not empty
- `phone`: string, 10-20 chars, optional (null allowed)
- `email`: rejected with error if present
- `id`: rejected with error if present
- Unknown fields: silently dropped

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Juan Pérez",
    "phone": "+573001234567"
  }
}
```

### POST /api/users/me/privacy-acceptance

Request body: empty
- `policyVersion` is read from server constant
- `policyType` is always `privacy_policy`
- `ipAddress` from `req.ip`
- `userAgent` from request header

Response (200):
```json
{
  "status": "accepted",
  "acceptedAt": "2026-06-30T10:00:00Z",
  "policyVersion": "1.0.0",
  "policyType": "privacy_policy"
}
```

## State Transitions

### Consent Flow

```
No acceptance record
  │
  ▼
[Blocking modal displayed]
  │
  ├── User accepts → POST /api/users/me/privacy-acceptance → 200
  │                                                     │
  │                                                     ▼
  │                                           [Profile visible]
  │
  ├── User refuses → Modal stays, profile hidden
  │
  └── User already accepted → Modal skipped, profile visible immediately
```

### Profile Edit Flow

```
[Read-only display]
  │
  ├── Click "Edit" → Form becomes editable
  │                     │
  │                     ├── Save → PATCH /api/users/me
  │                     │           │
  │                     │           ├── 200 → Update display, return to read-only
  │                     │           └── 422 → Show validation errors
  │                     │
  │                     └── Cancel → Discard changes, return to read-only
  │
  └── Click "Edit" when unchanged → No-op (button disabled)
```
