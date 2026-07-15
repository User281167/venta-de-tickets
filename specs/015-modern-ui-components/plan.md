# Implementation Plan: Interfaz moderna para landing y dashboard

**Branch**: `015-build-new-ui` | **Date**: 2026-07-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/015-modern-ui-components/spec.md`

**Additional constraints from user**:
- Reuse current project structure (monorepo: backend, frontend, whatsapp-bot).
- Frontend stack: Next.js App Router, Chakra UI, TanStack Query, Zod, Vitest.
- `app/` contains only layouts and pages; all business logic lives in `features/<domain>/`.
- Each feature folder groups components, API calls, hooks, schemas, types together.
- Keep UI, logic, and validations separate.
- Keep things simple; introduce abstractions only when needed.

## Summary

Modernize the public landing page and authenticated user dashboard for the university ticketing platform. The landing page already exists under `features/landing`; this plan refactors its components with consistent motion, hover transitions, and visual hierarchy while preserving the existing page composition. The user dashboard is introduced by transforming `/mi-cuenta` from a single profile form into a dashboard overview that reuses existing `users` feature data (tickets, payments, profile) and links to the existing detail pages. No backend changes are required; all data comes from current API endpoints.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.x, Next.js 16.x (App Router)

**Primary Dependencies**: Chakra UI 3.x, @emotion/react, @tanstack/react-query, Zod, @tabler/icons-react, sonner

**Storage**: N/A (frontend only; consumes existing backend API)

**Testing**: Vitest + @testing-library/react + @testing-library/user-event + jsdom

**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) with mobile-first responsive design

**Project Type**: Web application (monorepo frontend)

**Performance Goals**: First Contentful Paint < 2s on simulated 4G; interactions respond in < 100ms perceived time

**Constraints**: Animations must respect `prefers-reduced-motion`; no new dependencies for animations unless justified; UI must be WCAG 2.1 AA compliant

**Scale/Scope**: Single university ticketing deployment with thousands of tickets per event cycle

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Layered Architecture | Pass | Backend unchanged; frontend follows `app/` → `features/` → `shared/` layering. |
| II. Vertical Module Boundaries | Pass | Landing and dashboard logic stay inside `features/landing` and `features/users`; no cross-feature repository access. |
| III. WhatsApp Bot as Separate Service | Pass | No bot changes. |
| IV. Frontend Feature-Based Organization | Pass | `app/` keeps only layouts/pages; components, hooks, API calls, schemas, and types live under `features/<domain>/`. |
| V. Shared Code Is Infrastructure | Pass | Shared components remain generic (layout, UI providers); no domain logic moves to `shared/`. |
| Locked Technology Stack | Pass | Uses existing Chakra UI, TanStack Query, Zod, Vitest; no new stack choices. |

**Re-check after Phase 1**: No violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/015-modern-ui-components/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
frontend/
├── app/
│   ├── page.tsx                          # Landing page composition
│   ├── (protected)/
│   │   ├── layout.tsx                    # Protected shell (Navbar/Footer)
│   │   └── mi-cuenta/
│   │       ├── page.tsx                  # Dashboard overview (replaces pure ProfileForm)
│   │       ├── layout.tsx                # User sidebar shell
│   │       ├── entradas/page.tsx         # Existing tickets detail
│   │       └── pagos/page.tsx            # Existing payments detail
│   └── (public)/...                      # Public routes
├── features/
│   ├── landing/
│   │   ├── components/                   # Hero, TicketSection, CtaSection, etc.
│   │   ├── hooks/                        # (if needed) event query hooks
│   │   ├── api/                          # (if needed) public event fetch
│   │   ├── types/                        # Landing-specific types
│   │   └── schemas/                      # Zod schemas for landing forms (if any)
│   └── users/
│       ├── components/                   # DashboardOverview, TicketList, PaymentList, ProfileForm, UserSidebar
│       ├── hooks/                        # useMyTickets, usePayments, useProfile
│       ├── api/                          # tickets.client, payments.client, users.client
│       ├── schemas/                      # ticket, payment, user schemas
│       └── types/                        # ticket, payment types
├── shared/
│   ├── components/                       # Navbar, Footer, AdminSidebar, generic UI wrappers
│   ├── lib/                              # Supabase clients, query client
│   └── utils/                            # Generic formatting utilities
├── components/                           # App-wide providers and theme
├── providers/                            # Query/Auth/Chakra providers
└── test/                                 # Vitest config and test utilities
```

**Structure Decision**: The project already follows the monorepo frontend structure. The landing page is under `features/landing`; the user dashboard is under `features/users` because it reuses the same data contracts and authentication context. No new feature folders are needed beyond the existing ones. The `app/` directory only orchestrates layouts and pages; all components, hooks, and API calls remain in `features/`.

## Complexity Tracking

No constitution violations. No new abstractions required.

## Research Decisions

See [research.md](research.md) for details.

- **Animation strategy**: Use Chakra UI 3 built-in transition props (`transition`, `_hover`, `transform`, `boxShadow`) and CSS `@media (prefers-reduced-motion)` for micro-interactions. No animation library added.
- **Dashboard data strategy**: Reuse existing `useMyTickets`, `usePayments`, and `useProfile` hooks; combine their summaries in a new `DashboardOverview` component.
- **Responsive strategy**: Chakra UI `show/hide` props and `useBreakpointValue` for layout shifts; mobile-first design maintained.
- **Testing strategy**: Vitest component tests for dashboard and landing sections; existing test utilities reused.

## Phase 1 Design Artifacts

- [data-model.md](data-model.md) — entities consumed by the frontend
- [contracts/](contracts/) — API contracts consumed by landing and dashboard
- [quickstart.md](quickstart.md) — local development and verification steps

## Next Steps

1. Run `/speckit-tasks` to generate dependency-ordered tasks.
2. Implement dashboard overview component in `features/users/components/DashboardOverview.tsx`.
3. Refactor landing components with motion and hover transitions.
4. Update `/mi-cuenta/page.tsx` to render the dashboard overview.
5. Add/update Vitest tests for new components.
6. Run `pnpm test` and `pnpm build` in `frontend/` to verify.
