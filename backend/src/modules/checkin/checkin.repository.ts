import type { Prisma, TicketStatus } from '@prisma/client';

import { prisma } from '../../shared/database/prisma.client.js';
import type { TicketSummary } from './checkin.types.js';

const selectForScan = {
  id: true,
  status: true,
  checkedInAt: true,
  user: {
    select: {
      fullName: true,
      cedula: true,
    },
  },
  ticketType: {
    select: {
      name: true,
    },
  },
} as const;

export async function findTicketForScan(
  ticketId: string,
): Promise<TicketSummary | null> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: selectForScan,
  });

  if (!ticket) {
    return null;
  }

  return {
    ticketId: ticket.id,
    status: ticket.status,
    attendeeName: ticket.user.fullName,
    attendeeCedula: ticket.user.cedula,
    ticketTypeName: ticket.ticketType.name,
    checkedInAt: ticket.checkedInAt ? ticket.checkedInAt.toISOString() : null,
    allowedActions: [],
  };
}

async function transitionStatus(
  tx: Prisma.TransactionClient,
  ticketId: string,
  from: TicketStatus,
  to: TicketStatus,
  extra: Prisma.TicketUncheckedUpdateInput = {},
): Promise<boolean> {
  const result = await tx.ticket.updateMany({
    where: {
      id: ticketId,
      status: from,
    },
    data: {
      status: to,
      ...extra,
    },
  });

  return result.count > 0;
}

export async function confirmEntryDirect(
  ticketId: string,
  checkerId: string,
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    return transitionStatus(tx, ticketId, 'paid', 'used', {
      checkedInAt: new Date(),
      checkedInBy: checkerId,
    });
  });
}

export async function requestConfirmation(
  ticketId: string,
): Promise<
  | {
      ok: true;
      buyer: { fullName: string; email: string | null; phone: string | null };
    }
  | { ok: false; reason: 'not_found' | 'not_available' }
> {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM tickets WHERE id = ${ticketId}::uuid FOR UPDATE
    `;

    if (rows.length === 0) {
      return { ok: false, reason: 'not_found' as const };
    }

    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
      select: {
        status: true,
        user: {
          select: { fullName: true, email: true, phone: true },
        },
      },
    });

    if (!ticket) {
      return { ok: false, reason: 'not_found' as const };
    }

    if (ticket.status !== 'paid') {
      return { ok: false, reason: 'not_available' as const };
    }

    await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'pending_confirmation',
        confirmationRequestedAt: new Date(),
      },
    });

    return {
      ok: true as const,
      buyer: ticket.user,
    };
  });
}

export async function allowEntry(
  ticketId: string,
  checkerId: string,
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    return transitionStatus(tx, ticketId, 'confirmed', 'used', {
      checkedInAt: new Date(),
      checkedInBy: checkerId,
    });
  });
}

export async function confirmTicket(ticketId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    return transitionStatus(tx, ticketId, 'pending_confirmation', 'confirmed');
  });
}

export async function rejectConfirmation(ticketId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
      select: { status: true },
    });

    if (!ticket) {
      return false;
    }

    if (ticket.status !== 'pending_confirmation') {
      return false;
    }

    return transitionStatus(tx, ticketId, 'pending_confirmation', 'paid');
  });
}
