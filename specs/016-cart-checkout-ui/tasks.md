# Tasks: Rediseño de carrito y checkout

**Input**: Requerimientos directos del usuario para rediseñar la experiencia de compra de entradas.

**Prerequisites**: Ninguno. Se reutilizan hooks, provider y esquemas existentes en `frontend/features/ticket-purchase/`.

**Tests**: No se solicitaron tests nuevos. Se incluyen tareas de actualización de tests existentes cuando el cambio de UI pueda romperlos.

**Organization**: Tareas agrupadas por historia de usuario para implementación y validación independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos diferentes, sin dependencias).
- **[Story]**: Mapea a historia de usuario (US1, US2, US3, US4).
- Incluye rutas exactas en las descripciones.

---

## User Stories

- **US1 (P1)**: Rediseñar tarjetas de tipos de entrada en `/entradas` para mejorar jerarquía visual, estados (disponible/agotado) y acción de agregar.
- **US2 (P2)**: Rediseñar el resumen de orden en `/entradas` para mostrar ítems, totales y CTA con el nuevo lenguaje visual.
- **US3 (P3)**: Rediseñar el drawer del carrito e incluir acción para vaciar todo el carrito con confirmación.
- **US4 (P4)**: Rediseñar las páginas de resultado del checkout (`/checkout/success`, `/checkout/pending`, `/checkout/failure`) con estados claros y CTAs coherentes.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar tokens/utilidades compartidas que usarán todas las historias.

- [x] T001 [P] Revisar componentes existentes en `frontend/features/ticket-purchase/components/` y documentar qué props, hooks y esquemas se reutilizarán

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Asegurar que `useCart` expone todo lo necesario y que no hay dependencias bloqueantes.

**⚠️ CRITICAL**: Ninguna historia de UI debe comenzar hasta confirmar que `clearCart` ya existe y funciona.

- [x] T002 [P] Verificar que `frontend/providers/CartProvider.tsx` expone `clearCart` y que `frontend/features/ticket-purchase/hooks/useCart.ts` lo propaga

**Checkpoint**: `clearCart` está disponible en componentes consumidores.

---

## Phase 3: User Story 1 - Tarjetas de entradas en /entradas (Priority: P1) 🎯 MVP

**Goal**: Reemplazar el diseño actual de `TicketTypeCard` por una tarjeta moderna, legible y con estados visuales claros (disponible, poco stock, agotado).

**Independent Test**: Abrir `/entradas`, confirmar que cada tarjeta muestra nombre, descripción, precio, stock y control de cantidad; no hay desbordamiento horizontal en mobile; estado agotado es claro.

### Implementation for User Story 1

- [x] T003 [P] [US1] Rediseñar `frontend/features/ticket-purchase/components/TicketTypeCard.tsx` con fondo `brand.panel`, bordes translúcidos, tipografía jerárquica, badge de stock y CTA de agregar/cantidad consistente
- [x] T004 [P] [US1] Ajustar `frontend/features/ticket-purchase/components/TicketTypeGrid.tsx` para mantener la nueva tarjeta alineada y con espaciado responsivo
- [x] T005 [US1] Actualizar encabezado y layout de `frontend/features/ticket-purchase/components/TicketPurchaseClient.tsx` si el rediseño de tarjetas lo requiere
- [x] T006 [P] [US1] Revisar y actualizar `frontend/features/ticket-purchase/components/__tests__/TicketTypeCard.test.tsx` si cambian textos, roles o estructura accesible

**Checkpoint**: `/entradas` muestra las tarjetas con el nuevo diseño y los tests pasan.

---

## Phase 4: User Story 2 - Resumen de orden en /entradas (Priority: P2)

**Goal**: Reemplazar el diseño de `OrderSummary` para que resuma ítems, cantidades, total y CTA con el mismo lenguaje visual de las tarjetas.

**Independent Test**: En `/entradas`, agregar entradas al carrito y confirmar que el resumen refleja ítems, cantidad total y total monetizado; el estado vacío sigue siendo claro.

### Implementation for User Story 2

- [x] T007 [P] [US2] Rediseñar `frontend/features/ticket-purchase/components/OrderSummary.tsx` con tarjeta `brand.panel`, lista de ítems, separadores, total destacado, conteo de entradas y botón COMPRAR con gradiente
- [x] T008 [P] [US2] Asegurar que `OrderSummary` permanece sticky en desktop y se adapta en mobile sin romper el layout de `/entradas`
- [x] T009 [US2] Actualizar `frontend/features/ticket-purchase/components/__tests__/OrderSummary.test.tsx` si cambian textos o selectores

**Checkpoint**: El resumen de orden tiene el nuevo diseño y los tests pasan.

---

## Phase 5: User Story 3 - Drawer del carrito y vaciar carrito (Priority: P3)

**Goal**: Rediseñar el drawer del carrito y agregar una acción que permita eliminar todas las entradas de una sola vez, con confirmación.

**Independent Test**: Abrir el carrito desde el navbar, confirmar que los ítems se ven con el nuevo diseño; presionar "Vaciar carrito" solicita confirmación y luego limpia el carrito.

### Implementation for User Story 3

- [ ] T010 [P] [US3] Rediseñar `frontend/features/ticket-purchase/components/CartItemRow.tsx` con mejor espaciado, precio unitario, subtotal, control de cantidad y botón de eliminar individual
- [ ] T011 [P] [US3] Rediseñar `frontend/features/ticket-purchase/components/CartDrawer.tsx` con header, lista de ítems, footer con total y CTA COMPRAR, manteniendo `DrawerBackdrop` y `DrawerPositioner`
- [ ] T012 [US3] Agregar botón "Vaciar carrito" en `frontend/features/ticket-purchase/components/CartDrawer.tsx` que invoque `clearCart` solo después de una confirmación (dialog o alert nativo)
- [ ] T013 [US3] Actualizar `frontend/features/ticket-purchase/components/__tests__/CartDrawer.test.tsx` para cubrir el nuevo flujo de vaciar carrito y el rediseño
- [ ] T014 [P] [US3] Actualizar `frontend/features/ticket-purchase/components/__tests__/CartItemRow.test.tsx` si cambian selectores o textos

**Checkpoint**: El drawer se ve rediseñado, vaciar carrito funciona con confirmación y los tests pasan.

---

## Phase 6: User Story 4 - Páginas de resultado del checkout (Priority: P4)

**Goal**: Reemplazar el diseño de las páginas `/checkout/success`, `/checkout/pending` y `/checkout/failure` con tarjetas centradas, iconografía clara y CTAs coherentes.

**Independent Test**: Simular redirecciones a `/checkout/success`, `/checkout/pending` y `/checkout/failure`; cada una debe mostrar el estado correspondiente, detalles relevantes y un botón de retorno sin desbordarse en mobile.

### Implementation for User Story 4

- [ ] T015 [P] [US4] Rediseñar `frontend/app/(public)/checkout/success/page.tsx` con tarjeta centrada, icono de éxito, datos de transacción, mensaje de entradas por correo y CTA
- [ ] T016 [P] [US4] Rediseñar `frontend/app/(public)/checkout/pending/page.tsx` con tarjeta centrada, icono de reloj, mensaje de procesamiento y CTA
- [ ] T017 [P] [US4] Rediseñar `frontend/app/(public)/checkout/failure/page.tsx` con tarjeta centrada, icono de error, motivo del rechazo, opciones de reintento y CTA
- [ ] T018 [P] [US4] Extraer componente compartido opcional en `frontend/features/ticket-purchase/components/CheckoutResultLayout.tsx` si las tres páginas comparten estructura (centrado, tarjeta, tipografía)
- [ ] T019 [US4] Actualizar tests en `frontend/app/(public)/checkout/success/__tests__/CheckoutSuccessPage.test.tsx`, `frontend/app/(public)/checkout/pending/__tests__/CheckoutPendingPage.test.tsx` y `frontend/app/(public)/checkout/failure/__tests__/CheckoutFailurePage.test.tsx` si cambian textos o selectores

**Checkpoint**: Las tres páginas de resultado tienen el nuevo diseño y los tests pasan.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accesibilidad, responsividad y verificación de build.

- [ ] T020 [P] Revisar responsividad de `/entradas`, drawer del carrito y páginas de checkout en mobile, tablet y desktop; corregir desbordes o tarjetas truncadas
- [ ] T021 [P] Verificar contraste y foco en botones, inputs y links de las pantallas rediseñadas
- [ ] T022 [P] Ejecutar `pnpm build` en `frontend/` y corregir errores de TypeScript, ESLint o imports no usados
- [ ] T023 [P] Ejecutar `pnpm vitest run` en `frontend/` y corregir tests rotidos por el rediseño

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias.
- **Foundational (Phase 2)**: Depende de Setup; confirma que `clearCart` existe.
- **User Stories (Phase 3-6)**: Todas dependen de Foundational.
  - Pueden ejecutarse secuencialmente por prioridad (P1 → P2 → P3 → P4) o en paralelo si hay recursos.
- **Polish (Phase 7)**: Depende de todas las historias implementadas.

### User Story Dependencies

- **US1 (P1)**: Independiente; solo requiere Foundational.
- **US2 (P2)**: Independiente de US1 en código, pero visualmente debe alinearse con las tarjetas. Recomendado completar US1 primero o sincronizar tokens visuales.
- **US3 (P3)**: Independiente; comparte `CartItemRow` y `OrderSummary`, por lo que es recomendable hacerlo después o en paralelo con US2.
- **US4 (P4)**: Totalmente independiente de las anteriores.

### Within Each User Story

- US1: T003–T004 son paralelos; T005 depende de T003/T004; T006 es paralelo a T003–T005.
- US2: T007–T008 son paralelos; T009 depende de T007/T008.
- US3: T010–T011 son paralelos; T012 depende de T011; T013–T014 dependen de T010–T012.
- US4: T015–T017 son paralelos; T018 es paralelo; T019 depende de T015–T018.

### Parallel Opportunities

- Agent A: US1 (tarjetas de entradas) + ajustes en tests.
- Agent B: US2 (resumen de orden) + ajustes en tests.
- Agent C: US3 (drawer del carrito + vaciar carrito) + ajustes en tests.
- Agent D: US4 (páginas success/pending/failure) + ajustes en tests.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 y Phase 2.
2. Completar Phase 3: Tarjetas de entradas (T003–T006).
3. **STOP and VALIDATE**: Probar `/entradas` en mobile/desktop, verificar tarjetas y controles.

### Incremental Delivery

1. Tarjetas de entradas (US1) → validar → deploy.
2. Resumen de orden (US2) → validar → deploy.
3. Drawer del carrito + vaciar carrito (US3) → validar → deploy.
4. Páginas de checkout (US4) → validar → deploy.

---

## Notes

- `[P]` indica tareas paralelizables (archivos distintos, sin dependencias).
- `[Story]` mapea la tarea a una historia de usuario para trazabilidad.
- Cada historia de usuario debe ser completable y testeable de forma independiente.
- No se deben crear nuevos specs ni planes; este archivo es la única fuente de tareas.
- Commit después de cada historia de usuario o grupo lógico.
- Detenerse en cualquier checkpoint para validar una historia de forma independiente.
- Evitar: tareas vagas, conflictos por mismo archivo, dependencias cruzadas que rompan la independencia.
