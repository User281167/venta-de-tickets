# Tasks: Interfaz moderna para landing y dashboard

**Input**: Design documents from `/specs/015-modern-ui-components/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested; implementation tasks only.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to user story (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare content inventory and shared motion constants for the redesign.

- [x] T001 [P] Audit current landing component copy and images in `frontend/features/landing/components/` and document what Spanish copy and placeholder images/icons each section needs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base styles and skeleton utilities needed before any UI work.

**⚠️ CRITICAL**: No landing or dashboard component work should begin until T002 is complete.

- [x] T002 [P] Add `prefers-reduced-motion` fallback styles to `frontend/app/globals.css` so all animations can be disabled globally when the user prefers reduced motion
- [ ] T003 [P] Create a reusable `SkeletonButton` or `SkeletonHStack` placeholder pattern in `frontend/shared/components/SkeletonButton.tsx` for auth loading states

**Checkpoint**: Motion infrastructure and skeleton utilities ready.

---

## Phase 3: User Story 1 - Landing page rediseñada (Priority: P1) 🎯 MVP

**Goal**: Transform the public landing page into a modern, animated, responsive experience with Spanish copy, improved visual hierarchy, hover transitions, and a new partners carousel.

**Independent Test**: Open `http://localhost:3000/`, confirm all sections render without horizontal scroll, hover effects are smooth, and the partners carousel animates.

### Implementation for User Story 1

- [x] T004 [P] [US1] Redesign `frontend/features/landing/components/HeroSection.tsx` with Spanish convention copy, entrance animation (fade/slide via Chakra UI `transition`/`transform`), responsive typography, and a clear primary CTA button with hover glow/elevation
- [x] T005 [P] [US1] Redesign `frontend/features/landing/components/TicketSection.tsx` with hover transitions on cards (scale/shadow/color change), better event info layout (name, date, place, price), responsive grid, and Spanish labels
- [x] T006 [P] [US1] Redesign `frontend/features/landing/components/AboutSection.tsx` with improved layout, icons from `@tabler/icons-react`, Spanish copy, and subtle scroll reveal transition
- [x] T007 [P] [US1] Redesign `frontend/features/landing/components/BenefitsSection.tsx` with improved layout, benefit cards with hover lift, icons, and Spanish copy
- [x] T008 [P] [US1] Redesign `frontend/features/landing/components/SpeakersSection.tsx` with improved speaker cards, hover transitions, and Spanish copy
- [x] T009 [P] [US1] Redesign `frontend/features/landing/components/CtaSection.tsx` with background gradient animation or pulse, Spanish copy, and responsive CTA button
- [x] T010 [P] [US1] Redesign `frontend/features/landing/components/FaqSection.tsx` with accordion open/close animation, Spanish questions/answers, and responsive spacing
- [x] T011 [P] [US1] Redesign `frontend/features/landing/components/FullWidthSlider.tsx` with slide transitions (opacity/transform) and responsive image sizing
- [x] T012 [P] [US1] Create `frontend/features/landing/components/PartnersSection.tsx` with horizontal auto-scrolling carousel of 6-8 partner logos/icons, CSS `animation` or Chakra `transform` loop, pause on hover, and `prefers-reduced-motion` fallback
- [x] T013 [US1] Compose redesigned landing page in `frontend/app/page.tsx` importing all updated sections including the new `PartnersSection`
- [x] T014 [P] [US1] Ensure responsive spacing and sizing across all landing components using Chakra UI breakpoint props; no horizontal scroll on mobile/tablet/desktop

**Checkpoint**: Landing page is fully redesigned, animated, responsive, and independently viewable.

---

## Phase 4: User Story 2 - Dashboard de usuario (Priority: P2)

**Goal**: Introduce a dashboard overview on `/mi-cuenta` that summarizes tickets, payments, and profile info using existing data hooks.

**Independent Test**: Log in and navigate to `/mi-cuenta`; confirm the dashboard shows ticket count, recent payments, and profile completion without needing to visit sub-pages.

### Implementation for User Story 2

- [ ] T015 [P] [US2] Create `frontend/features/users/components/DashboardOverview.tsx` with summary widgets: active tickets count, recent payments list, profile completion status, and quick links to `/mi-cuenta/entradas` and `/mi-cuenta/pagos`
- [ ] T016 [US2] Update `frontend/app/(protected)/mi-cuenta/page.tsx` to render `DashboardOverview`; keep `ProfileForm` accessible via a link or tab inside the dashboard
- [ ] T017 [P] [US2] Add loading skeletons, empty states (no tickets / no payments), and error retry UI to `frontend/features/users/components/DashboardOverview.tsx`

**Checkpoint**: Dashboard renders and is independently usable.

---

## Phase 5: User Story 3 - Navegación fluida (Priority: P3)

**Goal**: Fix navbar auth loading state and ensure navigation remains coherent across public and private pages.

**Independent Test**: Refresh the page while logged in; confirm the navbar does not flash admin buttons before role resolves. Navigate between landing and dashboard; confirm active link is highlighted.

### Implementation for User Story 3

- [ ] T018 [US3] Fix `frontend/components/layout/Navbar.tsx`: while `isLoading` from `useAuth` is true, render `SkeletonButton` (or null) in the auth button area instead of showing Admin / Mi Perfil / Logout or Login / Register buttons; apply to both desktop `HStack` and mobile `Stack` menu
- [ ] T019 [P] [US3] Ensure active route highlight logic in `frontend/components/layout/Navbar.tsx` works for desktop links and mobile menu items using `usePathname`
- [ ] T020 [US3] Verify `frontend/app/(protected)/layout.tsx` handles browser back button gracefully without losing scroll or sidebar context

**Checkpoint**: Navbar auth loading is fixed and navigation state is consistent.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance, and build verification.

- [x] T021 [P] Responsive audit: open every updated page (landing, `/mi-cuenta`, `/mi-cuenta/entradas`, `/mi-cuenta/pagos`) on mobile, tablet, and desktop widths; fix any overflow or clipped elements
- [x] T022 [P] Motion audit: enable `prefers-reduced-motion` in OS settings and confirm all landing and dashboard animations are disabled or replaced with instant transitions
- [x] T023 [P] Run `pnpm build` in `frontend/` and fix any TypeScript, ESLint, or unused import errors introduced by the redesign

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational
  - Can proceed sequentially by priority (P1 → P2 → P3) or in parallel if staffed
- **Polish (Phase 6)**: Depends on all desired user stories

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational; no dependencies on other stories
- **US2 (P2)**: Can start after Foundational; reuses existing `features/users` hooks, no dependency on US1
- **US3 (P3)**: Can start after Foundational; touches `shared/components/Navbar.tsx`, no dependency on US1/US2

### Within Each User Story

- US1: T004–T012 are parallel (different component files); T013 depends on them; T014 is parallel to T004–T012
- US2: T015 is independent; T016 depends on T015; T017 depends on T015
- US3: T018 is independent; T019 is parallel to T018; T020 is independent

### Parallel Opportunities

- All landing component redesigns (T004–T012) can be worked on simultaneously by different agents.
- Dashboard overview (T015) and Navbar fix (T018) can be worked on in parallel.
- All polish tasks (T021–T023) can run in parallel after stories complete.

---

## Parallel Example: User Story 1

```bash
# Launch all landing component redesigns together:
Task: "Redesign HeroSection in frontend/features/landing/components/HeroSection.tsx"
Task: "Redesign TicketSection in frontend/features/landing/components/TicketSection.tsx"
Task: "Redesign AboutSection in frontend/features/landing/components/AboutSection.tsx"
Task: "Redesign BenefitsSection in frontend/features/landing/components/BenefitsSection.tsx"
Task: "Redesign SpeakersSection in frontend/features/landing/components/SpeakersSection.tsx"
Task: "Redesign CtaSection in frontend/features/landing/components/CtaSection.tsx"
Task: "Redesign FaqSection in frontend/features/landing/components/FaqSection.tsx"
Task: "Redesign FullWidthSlider in frontend/features/landing/components/FullWidthSlider.tsx"
Task: "Create PartnersSection in frontend/features/landing/components/PartnersSection.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3: Landing page redesign (T004–T014)
3. **STOP and VALIDATE**: Test landing on mobile/desktop, verify animations, check partners carousel
4. Deploy/demo if ready

### Incremental Delivery

1. Landing page (US1) → validate → deploy
2. Dashboard (US2) → validate → deploy
3. Navbar fix + navigation polish (US3) → validate → deploy

### Parallel Team Strategy

With multiple developers:
- Agent A: Landing components (Hero + Ticket + About)
- Agent B: Landing components (Benefits + Speakers + Cta + Faq + Slider)
- Agent C: PartnersSection + page.tsx composition
- Agent D: DashboardOverview + Navbar fix

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
