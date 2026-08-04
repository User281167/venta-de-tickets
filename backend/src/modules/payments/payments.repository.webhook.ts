import type { Prisma } from '@prisma/client';

import { prisma } from '../../shared/database/prisma.client.js';

export async function processPaymentWebhook(input: {
  paymentId: string;
  providerTxId: string;
  metadata: Prisma.InputJsonValue;
}) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.$executeRaw`
      UPDATE payments
      SET status = 'completed', provider_tx_id = ${input.providerTxId}, metadata = ${input.metadata}::jsonb
      WHERE id = ${input.paymentId}::uuid AND status = 'pending'
    `;

    if (updated === 0) return { processed: false };

    await tx.$executeRaw`
      UPDATE tickets
      SET status = 'paid', purchased_at = now()
      WHERE payment_id = ${input.paymentId}::uuid AND status = 'reserved'
    `;

    return { processed: true };
  });
}

// Bloquea (FOR UPDATE) los ticket_types involucrados en un reclamo, en orden
// estable por id para evitar deadlocks, y devuelve un mapa id -> fila.
// El caller verifica cupo y, si pasa, hace el UPDATE de quantity_sold.
async function lockTicketTypesForReclaim(
  tx: Prisma.TransactionClient,
  typeCounts: Map<string, number>,
): Promise<
  Map<string, { id: string; quantity_sold: number; quantity_total: number }>
> {
  const typeIds = [...typeCounts.keys()].sort();
  const typeRows = (await tx.$queryRaw`
    SELECT id, quantity_sold, quantity_total
    FROM ticket_types
    WHERE id = ANY(${typeIds}::uuid[])
    FOR UPDATE
  `) as Array<{ id: string; quantity_sold: number; quantity_total: number }>;

  return new Map(typeRows.map((r) => [r.id, r]));
}

// Cuenta cuántos tickets por ticket_type_id caben en un mapa bloqueado.
// Devuelve true si hay cupo para TODOS los tipos (todo o nada).
function canReclaimStock(
  typeCounts: Map<string, number>,
  typeMap: Map<string, { quantity_sold: number; quantity_total: number }>,
): boolean {
  for (const [typeId, count] of typeCounts) {
    const tt = typeMap.get(typeId);

    if (!tt || tt.quantity_sold + count > tt.quantity_total) {
      return false;
    }
  }

  return true;
}

// Re-descuenta (sube quantity_sold) para cada ticket_type según typeCounts.
async function applyReclaimStock(
  tx: Prisma.TransactionClient,
  typeCounts: Map<string, number>,
): Promise<void> {
  for (const [typeId, count] of typeCounts) {
    await tx.$executeRaw`
      UPDATE ticket_types SET quantity_sold = quantity_sold + ${count}
      WHERE id = ${typeId}::uuid
    `;
  }
}

// Reclama un pago que fue barrido a 'expired' antes de que llegara la webhook.
// Guarda atómica: solo procede si el pago SIGUE en 'expired' (evita doble
// reclamo por webhooks concurrentes). Si los tickets ya no tienen cupo en
// ticket_types, devuelve 'unfulfillable' (pago queda en limbo, sin stock).
export async function reclaimExpiredPayment(input: {
  paymentId: string;
  providerTxId: string;
  metadata: Prisma.InputJsonValue;
}): Promise<
  | { outcome: 'reclaimed'; ticketIds: string[] }
  | { outcome: 'unfulfillable' }
  | { outcome: 'already_processed' }
> {
  return prisma.$transaction(async (tx) => {
    const paymentRows = await tx.$queryRaw<Array<{ status: string }>>`
      SELECT status FROM payments WHERE id = ${input.paymentId}::uuid FOR UPDATE
    `;

    const payment = paymentRows[0];

    if (!payment || payment.status !== 'expired') {
      return { outcome: 'already_processed' as const };
    }

    const tickets = (await tx.$queryRaw`
      SELECT id, ticket_type_id
      FROM tickets
      WHERE payment_id = ${input.paymentId}::uuid AND status = 'expired'
    `) as Array<{ id: string; ticket_type_id: string }>;

    if (tickets.length === 0) {
      return { outcome: 'unfulfillable' as const };
    }

    const typeCounts = new Map<string, number>();
    for (const t of tickets) {
      typeCounts.set(
        t.ticket_type_id,
        (typeCounts.get(t.ticket_type_id) ?? 0) + 1,
      );
    }

    const typeMap = await lockTicketTypesForReclaim(tx, typeCounts);

    if (!canReclaimStock(typeCounts, typeMap)) {
      return { outcome: 'unfulfillable' as const };
    }

    await applyReclaimStock(tx, typeCounts);

    await tx.$executeRaw`
      UPDATE tickets
      SET status = 'paid', purchased_at = now()
      WHERE payment_id = ${input.paymentId}::uuid AND status = 'expired'
    `;

    await tx.$executeRaw`
      UPDATE payments
      SET status = 'completed', provider_tx_id = ${input.providerTxId}, metadata = ${input.metadata}::jsonb
      WHERE id = ${input.paymentId}::uuid
    `;

    return {
      outcome: 'reclaimed' as const,
      ticketIds: tickets.map((t) => t.id),
    };
  });
}

// Reclama un pago que el proveedor rechazó pero que el cliente aún puede
// reintentar. Mismo patrón que reclaimExpiredPayment, pero el pago origen
// está en 'failed' y los tickets pueden estar 'reserved' o 'expired'.
//
// Diferencia clave: solo se re-descuenta stock para los tickets que
// previamente fueron barridos a 'expired' (la rama hasExpired). Los que
// siguen en 'reserved' ya tienen su cupo contabilizado y no se tocan.
export async function reclaimFailedPayment(input: {
  paymentId: string;
  providerTxId: string;
  metadata: Prisma.InputJsonValue;
}): Promise<
  | { outcome: 'reclaimed'; ticketIds: string[] }
  | { outcome: 'unfulfillable' }
  | { outcome: 'already_processed' }
> {
  return prisma.$transaction(async (tx) => {
    const paymentRows = await tx.$queryRaw<Array<{ status: string }>>`
      SELECT status FROM payments WHERE id = ${input.paymentId}::uuid FOR UPDATE
    `;

    const payment = paymentRows[0];
    if (!payment || payment.status !== 'failed') {
      return { outcome: 'already_processed' as const };
    }

    const tickets = (await tx.$queryRaw`
      SELECT id, ticket_type_id, status
      FROM tickets
      WHERE payment_id = ${input.paymentId}::uuid AND status IN ('reserved', 'expired')
    `) as Array<{ id: string; ticket_type_id: string; status: string }>;

    if (tickets.length === 0) {
      return { outcome: 'unfulfillable' as const };
    }

    const typeCounts = new Map<string, number>();
    for (const t of tickets) {
      typeCounts.set(t.ticket_type_id, (typeCounts.get(t.ticket_type_id) ?? 0) + 1);
    }

    const hasExpired = tickets.some((t) => t.status === 'expired');

    if (hasExpired) {
      const typeMap = await lockTicketTypesForReclaim(tx, typeCounts);

      if (!canReclaimStock(typeCounts, typeMap)) {
        return { outcome: 'unfulfillable' as const };
      }

      await applyReclaimStock(tx, typeCounts);
    }

    await tx.$executeRaw`
      UPDATE tickets
      SET status = 'paid', purchased_at = now()
      WHERE payment_id = ${input.paymentId}::uuid AND status IN ('reserved', 'expired')
    `;

    await tx.$executeRaw`
      UPDATE payments
      SET status = 'completed', provider_tx_id = ${input.providerTxId}, metadata = ${input.metadata}::jsonb
      WHERE id = ${input.paymentId}::uuid
    `;

    return {
      outcome: 'reclaimed' as const,
      ticketIds: tickets.map((t) => t.id),
    };
  });
}

export function markUnfulfillable(
  paymentId: string,
  providerTxId: string,
  metadata: Prisma.InputJsonValue,
) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'completed_unfulfillable', providerTxId, metadata },
  });
}
