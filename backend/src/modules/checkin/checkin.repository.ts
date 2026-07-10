import { prisma } from '../../shared/database/prisma.client.js';
import type { CheckInResult } from './checkin.types.js';

export async function checkInDirect(
  ticketId: string,
  checkerId: string,
): Promise<CheckInResult> {
  return prisma.$transaction(async (tx) => {
    const [ticket] = await tx.$queryRaw<
      Array<{ id: string; status: string; checked_in_at: Date | null }>
    >`SELECT id, status, checked_in_at FROM tickets WHERE id = ${ticketId}::uuid FOR UPDATE`;

    if (!ticket) return { action: 'not_found' };
    if (ticket.status === 'used') return { action: 'already_used', ticket: { checkedInAt: ticket.checked_in_at! } };
    if (ticket.status !== 'paid') return { action: 'wrong_status', currentStatus: ticket.status };

    await tx.$executeRaw`
      UPDATE tickets SET status = 'used', checked_in_at = now(), checked_in_by = ${checkerId}::uuid
      WHERE id = ${ticketId}::uuid AND status = 'paid'
    `;

    return { action: 'entered', ticket: { id: ticketId } };
  });
}

export async function requestConfirmation(
  ticketId: string,
  checkerId: string,
): Promise<CheckInResult> {
  return prisma.$transaction(async (tx) => {
    const [ticket] = await tx.$queryRaw<
      Array<{ id: string; status: string; checked_in_at: Date | null }>
    >`SELECT id, status, checked_in_at FROM tickets WHERE id = ${ticketId}::uuid FOR UPDATE`;

    if (!ticket) return { action: 'not_found' };
    if (ticket.status === 'used') return { action: 'already_used', ticket: { checkedInAt: ticket.checked_in_at! } };
    if (ticket.status !== 'paid') return { action: 'wrong_status', currentStatus: ticket.status };

    const updated = await tx.$executeRaw`
      UPDATE tickets SET status = 'pending_confirmation', checked_in_by = ${checkerId}::uuid, confirmation_requested_at = now()
      WHERE id = ${ticketId}::uuid AND status = 'paid'
    `;

    if (updated === 0) return { action: 'wrong_status', currentStatus: 'paid' };

    return { action: 'pending_confirmation', ticket: { id: ticketId } };
  });
}

export async function confirmTicket(ticketId: string): Promise<CheckInResult> {
  return prisma.$transaction(async (tx) => {
    const [ticket] = await tx.$queryRaw<
      Array<{ id: string; status: string; checked_in_at: Date | null }>
    >`SELECT id, status, checked_in_at FROM tickets WHERE id = ${ticketId}::uuid FOR UPDATE`;

    if (!ticket) return { action: 'not_found' };
    if (ticket.status === 'used') return { action: 'already_used', ticket: { checkedInAt: ticket.checked_in_at! } };
    if (ticket.status !== 'pending_confirmation') return { action: 'wrong_status', currentStatus: ticket.status };

    const updated = await tx.$executeRaw`
      UPDATE tickets SET status = 'confirmed'
      WHERE id = ${ticketId}::uuid AND status = 'pending_confirmation'
    `;

    if (updated === 0) return { action: 'wrong_status', currentStatus: 'pending_confirmation' };

    return { action: 'confirmed_entry', ticket: { id: ticketId } };
  });
}

export async function rejectConfirmation(ticketId: string): Promise<CheckInResult> {
  return prisma.$transaction(async (tx) => {
    const [ticket] = await tx.$queryRaw<
      Array<{ id: string; status: string; checked_in_at: Date | null }>
    >`SELECT id, status, checked_in_at FROM tickets WHERE id = ${ticketId}::uuid FOR UPDATE`;

    if (!ticket) return { action: 'not_found' };
    if (ticket.status !== 'pending_confirmation') return { action: 'wrong_status', currentStatus: ticket.status };

    await tx.$executeRaw`
      UPDATE tickets SET status = 'paid', checked_in_by = NULL, confirmation_requested_at = NULL
      WHERE id = ${ticketId}::uuid AND status = 'pending_confirmation'
    `;

    return { action: 'wrong_status', currentStatus: 'paid' };
  });
}

export async function allowEntry(
  ticketId: string,
  checkerId: string,
): Promise<CheckInResult> {
  return prisma.$transaction(async (tx) => {
    const [ticket] = await tx.$queryRaw<
      Array<{ id: string; status: string; checked_in_at: Date | null }>
    >`SELECT id, status, checked_in_at FROM tickets WHERE id = ${ticketId}::uuid FOR UPDATE`;

    if (!ticket) return { action: 'not_found' };
    if (ticket.status === 'used') return { action: 'already_used', ticket: { checkedInAt: ticket.checked_in_at! } };
    if (ticket.status !== 'confirmed') return { action: 'wrong_status', currentStatus: ticket.status };

    await tx.$executeRaw`
      UPDATE tickets SET status = 'used', checked_in_at = now(), checked_in_by = ${checkerId}::uuid
      WHERE id = ${ticketId}::uuid AND status = 'confirmed'
    `;

    return { action: 'entered', ticket: { id: ticketId } };
  });
}

export async function findByPendingConfirmationAndConfirmed() {
  return prisma.$queryRaw<
    Array<{
      id: string;
      ticket_code: string;
      status: string;
      confirmation_requested_at: Date | null;
    }>
  >`
    SELECT id, ticket_code, status, confirmation_requested_at
    FROM tickets
    WHERE status IN ('pending_confirmation', 'confirmed')
    ORDER BY confirmation_requested_at ASC NULLS LAST
  `;
}
