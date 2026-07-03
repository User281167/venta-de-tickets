# Quickstart: Profile, Signup & Consent Flow

## What This Feature Does

1. Registration form with fullName, phone, and mandatory consent checkbox
2. Privacy consent recorded on first profile access
3. Redirect authenticated users from /login and /registro to /mi-cuenta

## Implementation Order

1. Update `auth.schema.ts` — add fullName, phone, consentGiven to register schema
2. Update `auth.client.ts` — signUp() passes user_metadata
3. Add consent checkbox to `RegisterForm.tsx`
4. Add redirect to page.tsx for /login and /registro

## Files to Modify

| File | Change |
|------|--------|
| `frontend/features/auth/schemas/auth.schema.ts` | Add consentGiven to registerSchema |
| `frontend/features/auth/components/RegisterForm.tsx` | Add consent checkbox |
| `frontend/app/(auth)/login/page.tsx` | Add auth redirect |
| `frontend/app/(auth)/registro/page.tsx` | Add auth redirect |
| `frontend/providers/AuthProvider.tsx` | (optional) export consent flag |

## No Backend Changes

Existing endpoints from 004-user-profile-panel handle everything:
- `POST /api/users/me/privacy-acceptance` records consent
- `GET /api/users/me` returns profile + consent status

## Verification

- `/registro` loads for unauthenticated users, redirects to /mi-cuenta when logged in
- `/login` redirects to /mi-cuenta when logged in
- Register form rejects submission without consent checkbox
- After signup + email confirm + first login, PrivacyConsentModal records acceptance
- Profile displays user data correctly
