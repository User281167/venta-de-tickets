import { prisma } from '../../shared/database/prisma.client.js';

export function findAllPublishedEvents() {
  return prisma.event.findMany({
    where: { status: 'published' },
    select: {
      id: true,
      title: true,
      description: true,
      eventDate: true,
      location: true,
      prefix: true,
    },
    orderBy: { eventDate: 'asc' },
  });
}

export function findEventById(eventId: string) {
  return prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      description: true,
      eventDate: true,
      doorsOpenAt: true,
      saleEndsAt: true,
      location: true,
      prefix: true,
      status: true,
    },
  });
}

export function findAllActive(eventId: string) {
  return prisma.ticketType.findMany({
    where: { eventId, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      quantityTotal: true,
      quantitySold: true,
      maxPerUser: true,
      saleEndsAt: true,
    },
    orderBy: { price: 'asc' },
  });
}

export function findAll(eventId: string) {
  return prisma.ticketType.findMany({
    where: { eventId },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      quantityTotal: true,
      quantitySold: true,
      maxPerUser: true,
      isActive: true,
      saleEndsAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

export function findById(id: string) {
  return prisma.ticketType.findUnique({ where: { id } });
}

export function create(data: {
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quantityTotal: number;
  maxPerUser?: number;
  saleEndsAt?: Date;
}) {
  return prisma.ticketType.create({ data });
}

export function update(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    quantityTotal?: number;
    maxPerUser?: number;
    isActive?: boolean;
    saleEndsAt?: Date | null;
  },
) {
  return prisma.ticketType.update({ where: { id }, data });
}

export function softDelete(id: string) {
  return prisma.ticketType.update({
    where: { id },
    data: { isActive: false },
  });
}
