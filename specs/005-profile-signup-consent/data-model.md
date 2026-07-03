# Data Model: Profile, Signup & Consent Flow

## Overview

No new database entities. Relies on existing `User` and `PrivacyAcceptance` entities from 001-prisma-schema-setup and 004-user-profile-panel. New metadata fields flow through Supabase `auth.users.user_metadata`.

## Entities

### User (existing, enhanced metadata)

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| id | UUID | `public.users.id` | PK, from Supabase Auth |
| email | String | `public.users.email` | Read-only after creation |
| fullName | String | `auth.users.user_metadata.full_name` → `public.users.full_name` | Set during signup |
| phone | String? | `auth.users.user_metadata.phone` → `public.users.phone` | Optional, set during signup |
| consentGiven | Boolean | `auth.users.user_metadata.consent_given` | UX gate flag, not persisted in public.users |
| isActive | Boolean | `public.users.is_active` | Existing field |

**Note**: Full name and phone fields already exist in `public.users` table from 004 migration. The signup flow populates them via Supabase `user_metadata` which feeds into `public.users` through DB trigger.

### PrivacyAcceptance (existing, unchanged)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| userId | UUID (FK → users.id) | Linked user |
| policyVersion | String | Server constant `1.0.0` |
| policyType | Enum | `privacy_policy` |
| ipAddress | String | Server-captured IP |
| userAgent | String | Client user-agent |
| acceptedAt | Timestamptz | Auto-set on creation |

## Validation Rules

All defined in existing Zod schemas:
- `registerSchema` (frontend): email (valid email), password (min 6 chars), fullName (min 1, max 150), phone (optional, min 10, max 20), consentGiven (must be true)
- `updateUserSchema` (backend): fullName (min 1, max 150), phone (optional, nullable, min 10, max 20)

## State Transitions

### Signup Flow
```
Form Submitted → Supabase signUp() → Email Confirmation Sent
                                          ↓
                                    User Confirms Email
                                          ↓
                                    First Login → Redirect to /mi-cuenta
                                          ↓
                              PrivacyConsentModal → POST /me/privacy-acceptance
                                          ↓
                                    Profile Visible
```

### Route Blocking
```
User visits /login or /registro
  → Check auth state
    → Authenticated: redirect to /mi-cuenta
    → Not authenticated: render page normally
```
