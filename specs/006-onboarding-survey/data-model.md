# Data Model: Post-Registration Onboarding Survey

## 1. Prisma Schema Changes

### New Enum

```prisma
enum SurveyType {
  onboarding
  event_survey
}
```

### Extended Model

```prisma
model SurveyResponse {
  id          String     @id @default(uuid()) @db.Uuid
  userId      String?    @map("user_id") @db.Uuid
  eventId     String?    @map("event_id") @db.Uuid
  surveyType  SurveyType @map("survey_type")
  responses   Json       @db.JsonB
  submittedAt DateTime   @default(now()) @map("submitted_at") @db.Timestamptz

  event Event? @relation(fields: [eventId], references: [id])
  user  User?  @relation(fields: [userId], references: [id])

  @@unique([userId, surveyType], name: "user_survey_type_unique")
  @@index([eventId])
  @@map("survey_responses")
}
```

### Changes from current

| Change | Reason |
|--------|--------|
| Add `SurveyType` enum with `onboarding` + `event_survey` | Discriminate survey purpose |
| Add `surveyType` field (required) | Every survey response needs a type |
| Make `eventId` optional (`String?`) | Onboarding surveys have no event |
| Add `@@unique([userId, surveyType])` | Idempotency: one row per user per survey type |

### Computed Field (not persisted)

`onboarding_survey_done: boolean` — derived in `users.service.ts`:

```ts
async function getMe(id: string) {
  // ...existing user fetch...
  const onboardingDone = await surveysRepo.existsByUserAndType(id, 'onboarding');
  return {
    user: { ... },
    consentStatus: { ... },
    onboarding_survey_done: onboardingDone,
  };
}
```

## 2. Validation Rules

| Field | Rule |
|-------|------|
| `surveyType` | Must be `"onboarding"` for this feature |
| `responses` | Array of `{ question_id: string, answer: string \| string[] }` |
| `responses` (content) | `question_id` required, non-empty string |
| `responses` (content) | `answer` required; string for single-select/text, string array for multi-select |
| `responses` (empty) | Valid — represents a skip |

## 3. State Transitions

```
[No survey row] ──POST /onboarding──→ [Row exists, onboarding_done = true]
                                        ↳ has answers → submitted
                                        ↳ empty array → skipped
```

One-way: once row exists for `(userId, onboarding)`, no transitions allowed.
Attempts to POST again return 200 (idempotent) without modifying data.
