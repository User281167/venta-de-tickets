<p align="center">
  <img src="frontend/public/logos-la-u/Horizontal - letras azules.png" alt="La U" width="360" />
</p>

<h1 align="center">Sistema de Entradas — La U</h1>

<p align="center">
  Plataforma de venta y gestión de tiquetes para eventos de La Universidad.<br/>
   Compra en línea, pago con Mercado Pago y ePayco, QR de ingreso y administración completa.
</p>

<p align="center">
  <img alt="Stack" src="https://img.shields.io/badge/stack-Monorepo-1f5b96"/>
  <img alt="Backend" src="https://img.shields.io/badge/backend-Express%20%2B%20TypeScript-000"/>
  <img alt="Frontend" src="https://img.shields.io/badge/frontend-Next.js%2016-000"/>
  <img alt="DB" src="https://img.shields.io/badge/db-Supabase%20Postgres%20%2B%20Prisma-1f5b96"/>
</p>

---

## Resumen del Proyecto

Plataforma para la **La Universidad Tecnológica de Pereira (UTP)** que permite:

- **Venta de entradas** en línea con selección de tipo (general, tipo VIP, egresado) y zona.
- **Checkout seguro** con Mercado Pago y ePayco, estado de pago verificado por webhooks.
- **Entrada digital** con **QR** validable desde el **check-in** en la puerta del evento.
- **Confirma/rechaza** de asistencia por link enviado por email.
- **Panel admin** con gestión de tiquetes, usuarios, pagos (incluida reversión), donaciones, analytics y auditoría.
- **Donaciones** asociadas a la compra.
- **Mensajería automática** (email) para confirmaciones, recordatorios y donaciones.

## Estructura del Repositorio (Monorepo)

| Carpeta | Descripción |
|---------|-------------|
| [`backend/`](backend/README.md) | API Express + TypeScript (REST). Capas `routes → controller → service → repository` por módulo. DB Prisma/Supabase, pagos, QR, rate-limit Upstash Redis. |
| [`frontend/`](frontend/README.md) | Aplicación Next.js (App Router) + Chakra UI + TanStack Query. Lógica en `features/<dominio>/`. |
| [`docs/`](docs/) | Decisiones de arquitectura, reglas críticas y diagramas. |
| [`specs/`](specs/) | Especificaciones por feature (spec.md, plan.md, tasks.md). |
| [`supabase/`](supabase/) | Funciones/scripts de Supabase. |

## Stack Principal

**Backend** — Express 5, TypeScript, Prisma ORM, Supabase Postgres, Mercado Pago, ePayco, Resend (email), Upstash Redis (rate limit), Zod, testes Vitest.

**Frontend** — Next.js (App Router), TypeScript, Chakra UI, TanStack Query/Supabase SSR, Zod, Recharts, Mercado Pago SDK, qr-scanner/qrcode.react.

## Comandos Rápidos

```bash
# Backend (API)
cd backend
pnpm install
pnpm dev            # dev server tsx watch → http://localhost:3001
pnpm test           # vitest

# Frontend (app web)
cd frontend
pnpm install
pnpm dev            # Next.js dev server → http://localhost:3000
pnpm test           # vitest
```

> Detalle de configuración, Prisma y comandos de despliegue en los README de cada carpeta.

## Arquitectura

Plataforma **monorepo**: API REST + aplicación web. Capas por módulo en el backend (`routes → controller → service → repository`) y `features/` en el frontend.
