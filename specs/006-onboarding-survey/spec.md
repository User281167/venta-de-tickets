# Feature Specification: Post-Registration Onboarding Survey

**Feature Branch**: `006-onboarding-survey`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: Post-Registration Onboarding Survey

## User Scenarios & Testing

### User Story 1 - New User Completes Survey After Registration (Priority: P1)

A newly registered user confirms their email, logs in, and is shown a brief
onboarding survey before reaching the main app. The user answers some or all
questions and submits. The survey never appears again.

**Why this priority**: Core value — audience data collection starts here.
Without this flow, no survey data is captured.

**Independent Test**: Register a new account, complete the survey, and verify
the user reaches their intended destination. Confirm the survey does not show
on subsequent visits.

**Acceptance Scenarios**:

1. **Given** a newly registered user who just logged in for the first time,
   **When** the app loads, **Then** the onboarding survey is displayed and
   the user does not proceed to the main content until they submit or skip.
2. **Given** a user who submitted the survey, **When** they log out and log
   back in, **Then** the survey is not shown again.
3. **Given** a user who answered only 2 of 4 questions, **When** they submit,
   **Then** only the answered questions are stored and the submission
   succeeds.

---

### User Story 2 - User Skips Survey After Registration (Priority: P1)

A newly registered user sees the onboarding survey but chooses to skip it.
The survey is dismissed, no answers are stored, and the user reaches the main
app. The survey never appears again.

**Why this priority**: Users must not be blocked from reaching the app. Skip
is the escape hatch that keeps the survey optional.

**Independent Test**: Register a new account, click "Skip", and verify the
user reaches their intended destination with no survey data stored. Confirm
the survey does not reappear on later visits.

**Acceptance Scenarios**:

1. **Given** a newly registered user viewing the onboarding survey, **When**
   they click "Skip", **Then** the survey is dismissed and the user
   proceeds to the main app.
2. **Given** a user who skipped the survey, **When** they revisit the app,
   **Then** the survey is not shown again.
3. **Given** a user who skipped the survey, **When** an admin checks the
   survey data, **Then** no answers exist for that user, but the survey is
   marked as completed (skipped).

---

### User Story 3 - Returning User Does Not See Survey (Priority: P2)

An existing user who previously submitted or skipped the onboarding survey
logs in and goes directly to the main app without any survey interruption.

**Why this priority**: Returning user experience must be seamless — no
repeated surveys.

**Independent Test**: Log in with an account that has already completed or
skipped the survey. Verify the user sees the main app content directly,
with no survey visible.

**Acceptance Scenarios**:

1. **Given** a returning user whose `onboarding_survey_done` flag is true,
   **When** they log in, **Then** the main app loads without showing the
   survey.
2. **Given** a returning user, **When** they access any authenticated page,
   **Then** no survey-related interruption occurs.

---

### Edge Cases

- What happens if the survey submission request fails (network error)?
  The user should see an error message and be able to retry or skip.
- What happens if a user re-registers with the same email after deleting
  their account? The new account should have its own survey status —
  no carryover from deleted accounts.
- What happens if the user refreshes the page while filling the survey?
  Partial in-progress answers may be lost (acceptable — user can re-enter);
  the survey should still be shown since they have not submitted or
  skipped.
- What happens if the survey endpoint is called twice in a row with the
  same answers? The second call should not create a duplicate record
  (idempotent).

## Requirements

### Functional Requirements

- **FR-1**: The system MUST display the onboarding survey to a user on their
  first app render after completing registration and login.
- **FR-2**: The system MUST provide a "Skip" option that dismisses the
  survey and marks the user as survey-completed without storing any answers.
- **FR-3**: Users MUST be able to submit partial answers (some questions
  answered, others left blank). Only the answered questions are stored.
- **FR-4**: The system MUST persist survey responses as a collection of
  `{ question_id, answer }` pairs linked to the user, the survey type, and
  a timestamp.
- **FR-5**: The survey storage endpoint MUST be idempotent — calling it
  multiple times for the same user and survey type does not create
  duplicate records.
- **FR-6**: The system MUST never show the survey again once the user has
  submitted or skipped it.
- **FR-7**: The user profile endpoint MUST include an
  `onboarding_survey_done` boolean flag indicating whether the user has
  completed or skipped the survey.
- **FR-8**: After submission or skip, the user MUST land on the same
  destination they would have reached without the survey (landing page or
  `/mi-cuenta` depending on the flow).
- **FR-9**: The system MUST return a clear error message if the survey
  submission fails, and allow the user to retry or skip.

### Key Entities

- **Survey Response**: A record linking a user to their answers for a
  specific survey type (`"onboarding"`). Contains the user identifier,
  survey type, a set of answer pairs (question reference + answer), and
  a timestamp. Each user may have at most one record per survey type.
- **Survey Completion Flag**: A boolean property on the user profile
  (`onboarding_survey_done`) that indicates whether the user has submitted
  or skipped the onboarding survey.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A new user can complete the entire onboarding survey (answer
  all questions and submit) in under 60 seconds.
- **SC-002**: A user who chooses to skip reaches their intended destination
  in under 3 seconds from clicking "Skip".
- **SC-003**: Returning users never see the survey — verified by logging in
  10 times with the same account after submission or skip.
- **SC-004**: The survey submission endpoint handles concurrent requests
  from the same user without creating duplicate records.
- **SC-005**: The `onboarding_survey_done` flag is accurate for 100% of
  users (verified by comparing flag against actual survey response
  existence).

## Assumptions

- Survey questions are fixed and defined in frontend configuration — no
  admin UI for editing questions is needed at this stage.
- Users have a stable internet connection during the brief survey flow.
- The survey is surfaced inside the existing protected app layout after
  authentication completes, not as a separate pre-auth step.
- The existing `GET /api/users/me` endpoint will be extended to include
  `onboarding_survey_done` — no new dedicated endpoint is needed for
  checking survey status.
- Survey responses do not contain personally identifiable information
  beyond what the user voluntarily shares in text fields.
- The feature builds on the existing user authentication and profile
  system — no new authentication flows are needed.
