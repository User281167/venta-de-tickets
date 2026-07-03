# API Contract: Onboarding Survey

## POST /api/surveys/onboarding

Submit or skip the onboarding survey.

### Authentication

Required. Bearer token in `Authorization` header.

### Request Body

```json
{
  "responses": [
    {
      "question_id": "gender",
      "answer": "Femenino"
    },
    {
      "question_id": "occupation",
      "answer": "Estudiante"
    },
    {
      "question_id": "area",
      "answer": "Ingeniería de Sistemas"
    },
    {
      "question_id": "how_heard",
      "answer": ["Redes sociales", "Un amigo"]
    }
  ]
}
```

- `responses`: array (required, may be empty for skip)
- Each item: `{ question_id: string, answer: string | string[] }`
- `question_id`: non-empty string matching keys in `onboarding.questions.ts`
- `answer`: string for single-select/text, string array for multi-select

### Response: 200 (Success)

```json
{
  "status": "ok",
  "survey_type": "onboarding",
  "response_count": 4
}
```

### Response: 409 (Conflict — duplicate)

Not needed — idempotent by design. Returns 200 instead of 409.

### Response: 422 (Validation Error)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Responses must be an array"
  }
}
```

### Response: 401 (Unauthorized)

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing Authorization header"
  }
}
```

## GET /api/users/me (extended)

Existing endpoint returns new field:

```json
{
  "user": { ... },
  "consentStatus": { ... },
  "onboarding_survey_done": true
}
```

`onboarding_survey_done`: `true` if a `survey_responses` row exists for this
user with `surveyType: "onboarding"`; `false` otherwise.

## Frontend Config: `onboarding.questions.ts`

Source of truth for question definitions:

```ts
export const ONBOARDING_QUESTIONS = [
  {
    id: 'gender',
    question: '¿Con qué género te identificas?',
    type: 'single',
    options: ['Masculino', 'Femenino', 'No binario', 'Prefiero no decirlo'],
    required: false,
  },
  {
    id: 'occupation',
    question: '¿Cuál es tu ocupación?',
    type: 'single',
    options: ['Estudiante', 'Docente', 'Profesional', 'Empresario', 'Otro'],
    required: false,
  },
  {
    id: 'area',
    question: '¿En qué área o carrera?',
    type: 'text',
    options: [],
    required: false,
  },
  {
    id: 'how_heard',
    question: '¿Cómo te enteraste del evento?',
    type: 'multi',
    options: ['Redes sociales', 'Email universitario', 'Un amigo', 'Cartelera campus', 'Otro'],
    required: false,
  },
] as const;
```
