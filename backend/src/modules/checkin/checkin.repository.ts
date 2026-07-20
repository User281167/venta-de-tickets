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
    attendeeCedula: ticket.user.cedula || '',
    ticketName: ticket.ticketType.name,
    checkedInAt: ticket.checkedInAt ? ticket.checkedInAt.toISOString() : null,
    allowedActions: [],
  };
}

export async function findTicketForScanTx(
  tx: Prisma.TransactionClient,
  ticketId: string,
): Promise<{
  id: string;
  status: TicketStatus;
  userId: string;
  user: { fullName: string; email: string | null; phone: string | null };
  ticketType: { name: string };
} | null> {
  const rows = await tx.$queryRaw<Array<{ id: string; status: TicketStatus }>>`
    SELECT id, status
    FROM tickets
    WHERE id = ${ticketId}::uuid
    FOR UPDATE
  `;

  if (rows.length === 0) {
    return null;
  }

  return tx.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      status: true,
      userId: true,
      user: {
        select: { fullName: true, cedula: true, email: true, phone: true },
      },
      ticketType: {
        select: { name: true },
      },
    },
  });
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
  _checkerId: string,
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    return transitionStatus(tx, ticketId, 'paid', 'pending_confirmation', {
      confirmationRequestedAt: new Date(),
    });
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
