# Trazabilidad Frontend — Agosto 2026

Resumen día a día del trabajo realizado en el frontend durante agosto 2026.
Fuente: `git log -- frontend/` del monorepo.

## 01/Ago/2026 — Página de métricas

- UI página de métricas (admin) con Recharts: dashboard de analytics.
- Componentes: AnalyticsDashboard, KPI cards, gráficos de área acumulada, funnel, línea semanal.
- Tabs por dominio: checkin, descuentos, donaciones, funnel, reembolsos, ventas, usuarios.
- Hook `useDateRange` para el rango de fechas; queries de analytics (300+ líneas).

## 02/Ago/2026 — Donaciones y descuentos

- Fix: donaciones no acumulaba en UI — renombrar estado de donación en UI, acumular donaciones por día.
- Remover todo lo relacionado a descuentos en la UI.

## 03/Ago/2026 — Cache de queries y mínimos

- Agregar tiempo de cache en TanStack Query para las queries (provider global + queries de analytics, admin-donations, admin-payments, admin-users, audit).
- Agregar mínimo de donación ePayco: solo acepta >= 5.000.
- Docs: README de configuración y ejecución del proyecto.