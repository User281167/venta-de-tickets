# Deploy: migración `ticket_types.zona`

## Resumen
Añade la columna `zona VARCHAR(20)` a la tabla `ticket_types` para vincular
tipos de entrada con zonas del venue (bronce / plata / vip). Reemplaza las
variables de entorno `NEXT_PUBLIC_ZONA_*_IDS` que el frontend consumía.

## Archivos
- `backend/prisma/schema.prisma` — campo `zona String?` + `@@index([zona])`
- `backend/prisma/migrations/20260801105321_add_ticket_types_zona/migration.sql`
  — SQL idempotente con `DO $$ ... information_schema` y `pg_indexes`
- `backend/src/modules/tickets/tickets.{repository,validators,service}.ts`
- `backend/src/modules/audit/audit.constants.ts` — `TICKET_TYPE_ZONA_ACTUALIZADA`
- `frontend/features/entradas/mapas/config/venueLayout.ts` — sin env
- `frontend/features/entradas/mapas/components/VenueMapContent.tsx` — agrupa
  por `tt.zona` y rellena `zone.ticketTypeIds`
- `frontend/features/ticket-types/components/TicketTypeForm.tsx` — selector
  con default "Bronce" y opción "Sin zona" → `null`

## Pre-deploy checklist (producción)

1. **Backup / snapshot de la DB antes de correr la migración.**
2. Confirmar que el release que se despliega incluye
   `backend/prisma/migrations/20260801105321_add_ticket_types_zona/`.
3. El SQL es idempotente: usa `IF NOT EXISTS` sobre
   `information_schema.columns` y `pg_indexes`. Si la columna o el índice
   ya existen (ej. deploy parcial, reintento), la migración no rompe.

## Aplicar migración

### Opción A — Prisma migrate deploy (recomendado)
```bash
cd backend
npx prisma migrate deploy
```
Aplica solo las migraciones pendientes. Si por cualquier razón Prisma falla
(lock de la DB, drift, etc.), usar la opción B.

### Opción B — Aplicar SQL manual
```bash
psql "$DATABASE_URL" -f backend/prisma/migrations/20260801105321_add_ticket_types_zona/migration.sql
```

## Verificar post-deploy

```sql
-- ¿Existe la columna?
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'ticket_types' AND column_name = 'zona';

-- ¿Existe el índice?
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'ticket_types'
  AND indexname = 'ticket_types_zona_idx';

-- ¿Tipos de entrada existentes sin zona asignada?
SELECT id, name, status FROM ticket_types WHERE zona IS NULL;
```

## Bind manual de zonas (opcional)

Después del deploy se puede poblar en masa desde el panel admin o por SQL:

```sql
UPDATE ticket_types SET zona = 'bronce' WHERE name ILIKE '%general%';
UPDATE ticket_types SET zona = 'plata'  WHERE name ILIKE '%plata%';
UPDATE ticket_types SET zona = 'vip'    WHERE name ILIKE '%vip%';
```

Los valores permitidos por la validación son exactamente:
`vip | plata | bronce | NULL`. Cualquier otro valor falla el Zod
(`VALIDATION_ERROR` 422).

## Rollback

```sql
DROP INDEX IF EXISTS "ticket_types_zona_idx";
ALTER TABLE "ticket_types" DROP COLUMN IF EXISTS "zona";
```

También revertir el código al commit anterior y re-desplegar.

## Variables de entorno

Eliminar de `.env`, `.env.example` y configuración de Railway:

- `NEXT_PUBLIC_ZONA_BRONCE_IDS`
- `NEXT_PUBLIC_ZONA_PLATA_IDS`
- `NEXT_PUBLIC_ZONA_VIP_IDS`

Estas ya no se leen. El binding vive en la DB.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Tipos existentes sin `zona` | El mapa los renderiza como "sin entradas" (puntos grises, sin click). UI indica "Sin zona" hasta que se asigne. |
| Caracteres no ASCII en `zona` | Validador solo acepta `vip`, `plata`, `bronce`. Cualquier otro string → 422. |
| Deploy parcial | SQL es idempotente (`IF NOT EXISTS`). Reintentar es seguro. |
| Cache de la app antes del deploy | El frontend se comunica vía API; sin columna → error 500 al listar. Desplegar backend antes que frontend. |

## Orden de deploy

1. **Backend** (incluye migración y Prisma client regenerado).
2. Esperar healthcheck OK.
3. **Frontend**.
4. Asignar `zona` a tipos existentes desde el panel admin.
5. Verificar `/entradas` y `/entradas/mapa` con todas las zonas en su sitio.
