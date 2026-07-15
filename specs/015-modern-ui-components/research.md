# Research: Interfaz moderna para landing y dashboard

## Decision: Animación y transiciones

**Decision**: Use Chakra UI 3 built-in transition props and CSS media queries for motion. Do not add a dedicated animation library.

**Rationale**:
- Chakra UI 3 provides `transition`, `transitionDuration`, `transitionTimingFunction`, `_hover`, `_focus`, `transform`, `boxShadow`, and color token transitions out of the box.
- The feature scope is limited to hover states, focus rings, card elevation, and subtle page-section reveals. These can be handled without `framer-motion` or `react-spring`.
- Adding a dependency increases bundle size and requires motion-reduction handling. Built-in CSS transitions respect `prefers-reduced-motion` automatically when wrapped in the appropriate media query.
- Keeps the implementation simple and aligned with the constitution's "simplicity over pattern purity" principle.

**Alternatives considered**:
- Framer Motion: powerful but overkill for hover/transition micro-interactions and adds ~40KB gzipped.
- CSS keyframe animations in globals.css: acceptable for simple fades but harder to co-locate with components.

## Decision: Organización del dashboard

**Decision**: Implement the authenticated dashboard inside `features/users` and render it on `/mi-cuenta`. Reuse existing `useMyTickets`, `usePayments`, and `useProfile` hooks.

**Rationale**:
- `/mi-cuenta` is already the authenticated user area with a sidebar linking to entradas and pagos.
- All required data contracts and TanStack Query hooks already exist in `features/users`.
- Creating a separate `features/dashboard` would split closely related user data and likely duplicate types/hooks.
- The dashboard is a composition layer over existing user data, not a new domain.

**Alternatives considered**:
- New `features/dashboard` folder: rejected because it would duplicate user data access and break vertical module boundaries.
- New `/dashboard` route: rejected because it fragments the user area; `/mi-cuenta` is the natural entry point.

## Decision: Separación de UI, lógica y validación

**Decision**: Enforce the existing convention strictly in new and refactored files.

**Rationale**:
- Components in `features/*/components/` render UI and call hooks.
- Hooks in `features/*/hooks/` encapsulate server-state logic (TanStack Query) and local state when trivial.
- API calls live in `features/*/api/*.client.ts` and return typed data.
- Zod schemas live in `features/*/schemas/` and are used before form submission or data transformation.
- This matches the current codebase pattern and keeps files small and testable.

**Alternatives considered**:
- Co-locating schemas with components: rejected because it mixes validation logic with presentation.
- Co-locating fetch calls inside hooks: acceptable for simple cases but current project separates them; consistency wins.

## Decision: Accesibilidad y movimiento reducido

**Decision**: Wrap all motion in `prefers-reduced-motion` checks using a small reusable wrapper or CSS media query.

**Rationale**:
- WCAG 2.1 AA is assumed by the spec.
- Users with vestibular disorders may be harmed by unwanted motion.
- Chakra UI's `shouldReduceMotion` from `@chakra-ui/react` can detect system preference.

**Alternatives considered**:
- Global CSS reset that disables all transitions: too blunt and can break useful state changes.

## Decision: Pruebas

**Decision**: Use Vitest + Testing Library for component tests; Playwright E2E is out of scope for this feature unless explicitly requested.

**Rationale**:
- Vitest is already configured in `frontend/package.json`.
- Existing `features/users/components/__tests__` provide a pattern to follow.
- Component-level tests are sufficient for validating dashboard rendering, empty states, and landing section presence.

**Alternatives considered**:
- Playwright E2E for landing and dashboard: valuable but should be a separate feature to keep scope focused.
