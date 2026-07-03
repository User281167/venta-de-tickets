# Tasks: Landing Page & Login UI

**Input**: Design documents from `/specs/002-landing-login-ui/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create Supabase client layer shared by all auth flows

- [x] T001 Install `@supabase/ssr` and `@tabler/icons-react` in `frontend/` via `pnpm add @supabase/ssr @tabler/icons-react`
- [x] T002 [P] Create browser Supabase client in `frontend/shared/lib/supabase/client.ts`
- [x] T003 [P] Create server Supabase client in `frontend/shared/lib/supabase/server.ts`
- [ ] T004 Configure Google OAuth redirect URL in Supabase dashboard: `http://localhost:3000/auth/callback`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Auth provider, Zod schemas, and API wrappers — needed by all auth pages

- [x] T005 [P] Create Zod validation schemas in `frontend/features/auth/schemas/auth.schema.ts` — `loginSchema` (email, password min 1), `registerSchema` (email, password min 8, confirmPassword match)
- [x] T006 [P] Create auth API client in `frontend/features/auth/api/auth.client.ts` — `signInWithPassword`, `signUp`, `signInWithGoogle`, `signOut`
- [x] T007 Create `AuthProvider` in `frontend/providers/AuthProvider.tsx` — wraps app, subscribes to `onAuthStateChange`, exposes user/session/loading via context
- [x] T008 Create `useAuth` hook in `frontend/features/auth/hooks/useAuth.ts` — reads context, throws if used outside provider

**Checkpoint**: Auth foundation ready — login/register forms can now consume these

---

## Phase 3: User Story 1 — Visitor registers and lands authenticated (Priority: P1) 🎯 MVP

**Goal**: First-time visitor can sign up at `/registro` and land authenticated on `/`

**Independent Test**: Visit `/registro`, fill valid email + password (8+ chars), submit → redirected to `/` with active session cookie

### Implementation for User Story 1

- [x] T009 [P] [US1] Create `RegisterForm` component in `frontend/features/auth/components/RegisterForm.tsx` — email/password/confirm fields, Zod validation, calls `signUp` from auth.client, inline error mapping
- [x] T010 [US1] Create register page at `frontend/app/(auth)/registro/page.tsx` — renders `RegisterForm`, redirects authenticated users to `/`

**Checkpoint**: US1 complete — registration flow works end-to-end

---

## Phase 4: User Story 2 — Returning user logs in with email/password (Priority: P1)

**Goal**: Registered user can log in at `/login` with email/password

**Independent Test**: Register → logout → revisit `/login` → enter same credentials → redirected to `/` with session restored

### Implementation for User Story 2

- [x] T011 [P] [US2] Create `LoginForm` component in `frontend/features/auth/components/LoginForm.tsx` — email/password fields, Zod validation, calls `signInWithPassword` from auth.client, inline error mapping, Google button placeholder
- [x] T012 [US2] Create login page at `frontend/app/(auth)/login/page.tsx` — renders `LoginForm`, redirects authenticated users to `/`

**Checkpoint**: US2 complete — email/password login works end-to-end

---

## Phase 5: User Story 3 — User logs in with Google OAuth (Priority: P1)

**Goal**: User clicks "Continuar con Google" on `/login`, completes Google consent, lands authenticated on `/`

**Independent Test**: Click Google button on `/login`, complete Google consent flow, land on `/` authenticated

### Implementation for User Story 3

- [x] T013 [P] [US3] Add Google button to `LoginForm` component — calls `signInWithGoogle` from auth.client, renders loading state during redirect
- [x] T014 [US3] Create OAuth callback route handler at `frontend/app/auth/callback/route.ts` — exchanges OAuth code for session via server client, redirects to `/`

**Checkpoint**: US3 complete — Google OAuth login works end-to-end

---

## Phase 6: User Story 4 — Authenticated user redirected away from auth pages (Priority: P2)

**Goal**: Logged-in users visiting `/login` or `/registro` are redirected to `/`

**Independent Test**: Log in, manually type `/login` in URL bar → redirected to `/`

### Implementation for User Story 4

- [x] T015 [US4] Create middleware at `frontend/proxy.ts` — refresh session via `getUser()`, redirect authenticated users away from `/login` and `/registro` to `/`, protect `mi-cuenta/*` and `admin/*` routes by redirecting unauthenticated users to `/login`
- [x] T016 [P] [US4] Create placeholder protected page at `frontend/app/(protected)/mi-cuenta/page.tsx` — simple wrapper to test route protection

**Checkpoint**: US4 complete — route protection and redirects work for both auth states

---

## Phase 7: User Story 5 — Landing page is publicly accessible (Priority: P2)

**Goal**: Visually branded landing page at `/` with full "FUTURE MINDS 2026" event content, Spanish copy, Tabler icons, and 4-color design system

**Independent Test**: Open `/` in private browser — landing renders all 10 sections with branded colors and Tabler icons, no login wall

### Setup for User Story 5

- [x] T017 [P] [US5] Install `@tabler/icons-react` in `frontend/` via `pnpm add @tabler/icons-react` (if not done in T001)
- [x] T018 [US5] Create Chakra UI v3 theme in `frontend/components/ui/theme.ts` — `createSystem(defaultConfig, config)` with brand colors: `#F5F5F5` (light bg), `#76ABAE` (primary accent), `#303841` (dark text/sections), `#FF5722` (CTA/highlight)
- [x] T019 [P] [US5] Add brand colors to Tailwind `@theme` block in `frontend/app/globals.css` — `--color-brand-light: #F5F5F5`, `--color-brand-teal: #76ABAE`, `--color-brand-dark: #303841`, `--color-brand-orange: #FF5722`
- [x] T020 [US5] Update root `layout.tsx` to use the new Chakra theme and update metadata to Spanish (title: "Future Minds 2026", description: event pitch)

### Implementation for User Story 5 — Sections

- [x] T021 [P] [US5] Create Hero section component — title "FUTURE MINDS 2026: Ideas que están cambiando el mundo", subtitle, short pitch, CTAs ("Consigue tu boleta", "Ver agenda"), quick info with Tabler icons (location, date, time, limited spots). Use conference image from `public/conferencia-1.jpg`
- [x] T022 [P] [US5] Create "Sobre el evento" section — "¿Qué es Future Minds?" title, description copy about academic/experiential day connecting students with industry leaders
- [x] T023 [P] [US5] Create Speakers section — "Speakers invitados" title, 4 cards (Dr. Elena Martínez, Carlos Vega, Laura Gómez, Andrés Ruiz) with Tabler icons, name, role, topic. Images from `public/elena.jpg`, `public/carlos.jpg`, `public/andres.jpg`, `public/laura.jpg`
- [x] T024 [P] [US5] Create Agenda section — "Programa del día" title, 6-item timeline with Tabler clock/icon per item (registro → keynote → panel → almuerzo → charlas → cierre)
- [x] T025 [P] [US5] Create Benefits section — "¿Por qué asistir?" title, 5-item list with Tabler icons (conferencias, certificado, networking, material exclusivo, sorteos)
- [x] T026 [P] [US5] Create Ticket types section — "Elige tu entrada" title, 3 tiers with Tabler icons: General $15, Premium $35, VIP $75. Feature lists per tier. CTA: "Compra tu boleta ahora"
- [x] T027 [P] [US5] Create Testimonials section — "Lo que dicen eventos anteriores" title, 3 quote cards with Tabler quote icon, student/participant attribution
- [x] T028 [P] [US5] Create FAQ section — "Preguntas frecuentes" title, 4 accordion items using Chakra v3 `Accordion.Root`: attendance (open), certificate, transfer, refund
- [x] T029 [P] [US5] Create Final CTA section — "No te quedes fuera del futuro" title, pitch text, "Quiero mi entrada ahora" CTA button
- [x] T030 [P] [US5] Create Footer section — "Universidad Central – Eventos Académicos", email contact with Tabler mail icon, social links with Tabler icons, "Términos y condiciones | Política de privacidad"
- [x] T031 [US5] Compose landing page at `frontend/app/(public)/page.tsx` — import and render all 10 section components in order

**Checkpoint**: US5 complete — full branded landing page rendered at `/` with all 10 sections

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Visual polish, responsive pass, manual QA across all auth + landing

- [ ] T032 [P] Responsive pass — verify all pages render correctly at mobile (320px), tablet (768px), desktop (1280px) breakpoints using Chakra v3 responsive props. Ensure brand colors maintain contrast in both light/dark modes
- [x] T033 [P] Source or create `public/laura.jpg` speaker image — replace placeholder in Speakers section, or accept gradient fallback
- [ ] T034 Manual test pass: register, login, password error, Google login flow, protected route redirect, session survives full page reload, landing page renders all 10 sections with icons and colors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all auth user stories
- **Phase 3-6 (Auth user stories US1-US4)**: All depend on Phase 1 + 2 — sequential dependency chain (T009→T012→T014→T015)
- **Phase 7 (US5 — Landing page)**: Independent of Phase 1-6 — can start in parallel with Phase 2 after T001 installs icons
- **Phase 8 (Polish)**: Depends on Phase 3, 4, 5, 7

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 1 + 2. No deps on other stories.
- **US2 (P1)**: Depends on Phase 1 + 2 + US1. Login form shares patterns from RegisterForm.
- **US3 (P1)**: Depends on Phase 1 + 2 + US2. Google button lives in LoginForm.
- **US4 (P2)**: Depends on Phase 1 + 2 + US3. Middleware needs session types from auth client.
- **US5 (P2)**: **Parallelizable** — zero deps on auth stories, only needs T001/T017 for icon install.

### Parallel Opportunities

| Group | Tasks | Parallel with |
|-------|-------|---------------|
| Supabase clients | T002, T003 | Each other |
| Auth schemas + API client | T005, T006 | Each other |
| Landing page sections | T021-T030 | Each other AND Phase 2-6 |
| Theme + CSS | T018, T019, T020 | Each other AND section components |
| Polish | T032, T033 | Each other |

---

## Parallel Example: US5 (Landing — independent of auth)

```bash
# Install theme + icons first (blocking):
Task: "Create Chakra v3 theme with brand colors" (T018)
Task: "Add brand colors to Tailwind globals.css" (T019)

# Then all 10 landing sections in parallel:
Task: "Create Hero section" (T021)
Task: "Create Sobre el evento section" (T022)
Task: "Create Speakers section" (T023)
Task: "Create Agenda section" (T024)
Task: "Create Benefits section" (T025)
Task: "Create Ticket types section" (T026)
Task: "Create Testimonials section" (T027)
Task: "Create FAQ section" (T028)
Task: "Create Final CTA section" (T029)
Task: "Create Footer section" (T030)
```

## Implementation Strategy

### MVP First (US1 + US5)

1. Complete Phase 1: Setup (T001-T004) — install `@tabler/icons-react` here too
2. Complete Phase 2: Foundational (T005-T008)
3. **PARALLEL**: Phase 3: US1 — Register (T009-T010) + Phase 7: US5 theme (T018-T020)
4. **PARALLEL**: US5 sections (T021-T030) after theme done
5. Compose landing (T031) after all sections done
6. **STOP and VALIDATE**: Test register flow + landing with full branding
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Register) + US5 (Landing) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Login) → Test independently → Deploy/Demo
4. Add US3 (Google OAuth) → Test independently → Deploy/Demo
5. Add US4 (Route protection) → Test independently → Deploy/Demo
6. Polish → Final QA

### Parallel Team Strategy

With 2+ developers:

1. Dev A: Phase 1 + 2 + US1 (auth foundation + register)
2. Dev B: Phase 7 (landing page — zero deps on auth)
3. Dev B starts with T018-T020 (theme/CSS), then T021-T031 (sections)
4. Dev A continues through US2 → US3 → US4 after Phase 2
5. Phase 8: Both polish together

---

## Notes

- **File paths**: Project uses root-level `frontend/app/`, `frontend/components/`, `frontend/features/` — no `src/` directory
- **Chakra UI v3**: Theme uses `createSystem(defaultConfig, config)` API, not `extendTheme`. Forms use `Field.Root`/`Field.Label`/`Field.ErrorText`, not `FormControl`/`FormLabel`/`FormErrorMessage`
- **Colors**: `#F5F5F5` (light bg), `#76ABAE` (primary teal), `#303841` (dark slate), `#FF5722` (orange CTA)
- **Icons**: Import from `@tabler/icons-react` — e.g., `import { IconTicket } from '@tabler/icons-react'`
- **Speaker images**: `elena.jpg`, `carlos.jpg`, `andres.jpg` exist in `public/`. `laura.jpg` is missing — use gradient/icon placeholder
- **Auth forms use `@supabase/ssr`** browser client — never `@supabase/auth-helpers-nextjs`
- **Supabase error mapping table** in `research.md`
- **Content**: All UI copy in Spanish per project conventions
