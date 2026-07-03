# Data Model: Admin Core

## Entities

### Admin

Represents an administrative user with role-based permissions.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | Primary key, matches Supabase Auth user id |
| email | string | Yes | Unique, used for login |
| name | string | Yes | Display name |
| role | enum (AdminRole) | Yes | `super_admin`, `organizer`, or `checker` |
| created_at | timestamptz | Yes | Default now() |
| updated_at | timestamptz | Yes | Auto-updated |

**Relationships**:
- Each Admin maps to a Supabase Auth user (same UUID in `auth.users`)

**Validation**:
- `email`: valid email format, unique
- `role`: must be one of AdminRole enum values
- `name`: non-empty, max 255 chars

### User (existing, referenced)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | string | Display name |
| email | string | Unique |

### OnboardingSurveyResponse (existing, referenced)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| answers | JSONB | Survey answers structure |
| created_at | timestamptz | Submission timestamp |

**View for admin**: `SELECT u.name, u.email, osr.answers, osr.created_at FROM onboarding_survey_responses osr JOIN users u ON u.id = osr.user_id`

## State Transitions

- **Admin session**: Active → Expired (via JWT expiry) → Requires re-login
- **Admin role**: Immutable after creation (no role change in this feature)
