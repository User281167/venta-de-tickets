# API Contracts

No new endpoints. Feature reuses existing contracts from 004-user-profile-panel:

## Used Endpoints

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/api/users/me/privacy-acceptance` | Record privacy consent after first login | Bearer token |
| GET | `/api/users/me` | Fetch user profile + consent status | Bearer token |
| PATCH | `/api/users/me` | Update profile fields (fullName, phone) | Bearer token |

## Supabase Auth (no custom endpoint)

| Call | Purpose | Notes |
|------|---------|-------|
| `supabase.auth.signUp({ email, password, options: { data } })` | Register user | Passes fullName, phone, consentGiven as user_metadata |
| `supabase.auth.signInWithPassword()` | Login | Existing |
| `supabase.auth.onAuthStateChange()` | Session listener | Existing in AuthProvider |
