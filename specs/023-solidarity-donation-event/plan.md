# Implementation Plan: Reestructuración solidaria — La U del Futuro 2026

**Branch**: `023-solidarity-donation-event` | **Date**: 2026-10-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/023-solidarity-donation-event/spec.md`

## Summary

Reorient the site to “La U del Futuro 2026”, a one-day institutional event with UTPton-only donations. Reuse the donation flow, providers, public counter, editable admin goal, and existing UTPton assets. Redirect obsolete public ticket/account routes in Next.js and disable obsolete ticketing, client-user, payment, confirmation, and check-in endpoints in Express. Keep only donation endpoints and the staff/admin endpoints needed for staff session, admin identity, and donation list/counter management. Keep old pages/modules in the repository; no schema migration or new payment provider.

## Technical Context

**Language/Version**: TypeScript 5.x frontend; TypeScript 6.x backend; Node.js 20+ baseline

**Primary Dependencies**: Frontend Next.js 16, React 19, Chakra UI 3, TanStack Query, Supabase SSR; backend Express 5, Prisma 7, Zod, Supabase Auth; existing Mercado Pago/ePayco donation providers

**Storage**: Existing PostgreSQL/Supabase donation and donation-counter records. No new table or migration.

**Testing**: Frontend Vitest/Testing Library; backend Vitest/Supertest. Manual browser checks for provider returns, route redirects, staff authorization, and responsive layout. Run `pnpm test` and `pnpm lint` from each touched package before implementation commit, per repository instructions.

**Target Platform**: Vercel frontend, Railway API; mobile and desktop browsers.

**Project Type**: Frontend public experience plus Express API route deactivation in an existing monorepo.

**Performance Goals**: Keep current donation checkout and counter behavior; no new polling or blocking media added.

**Constraints**:
- Donations continue using the existing providers, endpoints, webhook verification, data model, and return routes.
- Public donations go to UTPton only; no Asociación de Egresados or Barranqueros destination option.
- Preserve automatic donation-counter updates and admin ability to edit the current value and goal.
- Disable old ticket sales, personal account, end-user and attendance business APIs in Express, not only frontend links.
- Retain staff authentication/session, admin identity, donation administration/list, and admin counter endpoint.
- Keep pages/modules in the repository; hide or redirect obsolete routes rather than delete source.
- Inspect and integrate existing user edits in `frontend/app/page.tsx` and supplied untracked assets in `frontend/public/assets/utpton/`; do not overwrite them wholesale.
- No database or Prisma CLI mutation.

**Scale/Scope**: Frontend identity, event program, donation messaging, navigation and route guards; Express mount/route policy for ticketing and regular-client APIs; admin donation counter/list preserved.

## Constitution Check

| Principle | Status | Evidence |
|---|---|---|
| I. Layered architecture | PASS | Any Express policy changes stay in app/router layers; no business logic moves to controllers. |
| II. Vertical module boundaries | PASS | Donation logic remains in `donaciones`; unrelated modules are disabled at route registration, not merged. |
| III. WhatsApp separation | N/A | No bot changes. |
| IV. Feature-based frontend | PASS | `app/` remains route/composition only; landing, agenda, donation features own UI/domain behavior. |
| V. Shared code is infrastructure | PASS | Proxy is route access infrastructure; no donation behavior moves to `shared/`. |
| Locked stack and data rules | PASS | No new framework, provider, storage, or migration. |
| Privacy and legal accuracy | PASS WITH REVIEW | Preserve donation consent/notice and update obsolete purchase/account disclosures. |

No constitution violation identified. Constitution source: `.specify/memory/constitution.md`.

## Research Decisions

See [research.md](research.md). Donation provider/flow/counter are already implemented and must be reused. Express keeps a narrow allowlist for public donations plus staff session and admin donation list/counter. No other legacy business API remains operational.

## Project Structure

### Documentation

```text
specs/023-solidarity-donation-event/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/app.ts                                      # disable obsolete router mounts
├── src/modules/admins/admins.routes.ts             # preserve admin identity/donation list/counter only
├── src/modules/donaciones/donaciones.routes.ts     # preserve current working endpoints
├── src/modules/{tickets,users,me,payments,checkin,confirmations}/ # preserve source; deactivate endpoints
└── test/                                           # route allowlist and retained donation tests

frontend/
├── app/page.tsx                                    # event-first public composition
├── app/agenda/page.tsx                             # current one-day agenda
├── app/(auth)/login/page.tsx                       # staff-only sign-in
├── app/(auth)/registro/page.tsx                    # retained but disabled
├── app/(public)/terminos/page.tsx                  # update old purchase claims
├── app/(public)/privacidad/page.tsx                # update old account/ticket purposes
├── proxy.ts                                        # redirect old public routes; preserve staff/donation paths
├── components/layout/Navbar.tsx                    # event, agenda, donation nav; no public ticket links
├── features/landing/components/                   # event identity and solidarity copy
├── features/agenda/data/agenda.ts                 # one-day program
├── features/agenda/components/                    # updated agenda presentation
├── features/donaciones/components/                 # retain working donation/counter presentation
├── features/admin-donations/                        # retain editable counter/meta administration
└── public/assets/utpton/                           # supplied campaign assets/logos
```

**Structure Decision**: Keep the existing monorepo. Express route registration will disable ticketing/user/attendance APIs while retaining the working donation module and minimum auth/admin endpoints required for staff and donation-counter management. Existing domain files remain intact for reversibility.

## Complexity Tracking

No constitution violations; no new abstraction, payment provider, database schema, or migration.

