# GET /api/admin/surveys/onboarding

Onboarding survey responses joined with user name/email. Restricted to `super_admin` and `organizer`.

## Request

```
GET /api/admin/surveys/onboarding
Authorization: Bearer <jwt>
```

## Response 200

```json
{
  "data": [
    {
      "userId": "uuid",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "answers": { "favoriteGenre": "rock", "referralSource": "instagram" },
      "submittedAt": "2026-06-15T10:30:00Z"
    }
  ]
}
```

## Response 401

```json
{ "error": "Unauthorized" }
```

## Response 403

```json
{ "error": "Forbidden: Insufficient permissions" }
```
