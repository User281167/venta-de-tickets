import { prisma } from '../../shared/database/prisma.client.js';

const selectTicketType = {
  id: true,
  name: true,
  description: true,
  price: true,
  quantityTotal: true,
  quantitySold: true,
  maxPerUser: true,
  saleEndsAt: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function findAllPublic(page: number, limit: number) {
  return prisma.ticketType.findMany({
    where: { status: { not: 'blocked' } },
    select: selectTicketType,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'asc' },
  });
}

export function countPublic() {
  return prisma.ticketType.count({
    where: { status: { not: 'blocked' } },
  });
}

export function findById(id: string) {
  return prisma.ticketType.findUnique({
    where: { id },
    select: selectTicketType,
  });
}

export function create(data: {
  name: string;
  description?: string;
  price: number;
  quantityTotal: number;
  maxPerUser?: number;
  saleEndsAt?: Date;
}) {
  return prisma.ticketType.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      quantityTotal: data.quantityTotal,
      maxPerUser: data.maxPerUser ?? null,
      saleEndsAt: data.saleEndsAt ?? null,
    },
    select: selectTicketType,
  });
}

export function findAllAdmin(page: number, limit: number) {
  return prisma.ticketType.findMany({
    select: selectTicketType,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'asc' },
  });
}

export function countAll() {
  return prisma.ticketType.count();
}

export function update(id: string, data: Record<string, unknown>) {
  return prisma.ticketType.update({
    where: { id },
    data: data as any,
    select: selectTicketType,
  });
}

export function updateQrToken(ticketId: string, qrToken: string) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { qrToken },
  });
}

const selectTicketForOwner = {
  id: true,
  ticketCode: true,
  qrToken: true,
  status: true,
  purchasedAt: true,
  createdAt: true,
  ticketType: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

export function findByUserId(userId: string, page: number, limit: number) {
  return prisma.ticket.findMany({
    where: { userId },
    select: selectTicketForOwner,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export function countByUserId(userId: string) {
  return prisma.ticket.count({
    where: { userId },
  });
}

export function findOwnedById(ticketId: string, userId: string) {
  return prisma.ticket.findFirst({
    where: { id: ticketId, userId },
    select: selectTicketForOwner,
  });
}

export async function createAdminSale(input: {
  ticketTypeId: string;
  userId: string;
  quantity: number;
  generateTicketCode: () => string;
}) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      Array<{ quantity_sold: number; quantity_total: number; status: string }>
    >`SELECT quantity_sold, quantity_total, status FROM ticket_types WHERE id = ${input.ticketTypeId}::uuid FOR UPDATE`;

    const ticketType = rows[0];

    if (!ticketType) {
      throw Object.assign(new Error('Ticket type not found'), {
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    }

    if (ticketType.status !== 'enabled') {
      throw Object.assign(new Error('Ticket type is not available'), {
        statusCode: 400,
        code: 'TICKET_TYPE_NOT_AVAILABLE',
      });
    }

    if (ticketType.quantity_sold + input.quantity > ticketType.quantity_total) {
      throw Object.assign(new Error('Insufficient stock'), {
        statusCode: 409,
        code: 'SOLD_OUT',
      });
    }

    await tx.$executeRaw`
      UPDATE ticket_types
      SET quantity_sold = quantity_sold + ${input.quantity}
      WHERE id = ${input.ticketTypeId}::uuid
    `;

    const ticketIds: string[] = [];

    for (let i = 0; i < input.quantity; i++) {
      const ticketCode = input.generateTicketCode();
      const result = await tx.$queryRaw<Array<{ id: string }>>`
        INSERT INTO tickets (id, ticket_type_id, user_id, status, purchased_at, ticket_code)
        VALUES (gen_random_uuid(), ${input.ticketTypeId}::uuid, ${input.userId}::uuid, 'paid', now(), ${ticketCode})
        RETURNING id
      `;
      ticketIds.push(result[0].id);
    }

    return ticketIds;
  });
}
