import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import * as repo from './ticket-types.repository.js';

export async function listPublishedEvents() {
  return repo.findAllPublishedEvents();
}

export async function getEventWithAvailability(eventId: string) {
  const event = await repo.findEventById(eventId);

  if (!event) {
    throw new NotFoundError('Evento no encontrado');
  }

  const ticketTypes = await repo.findAllActive(eventId);

  const types = ticketTypes.map((t) => {
    const availableCount = t.quantityTotal - t.quantitySold;

    return {
      id: t.id,
      name: t.name,
      description: t.description,
      price: t.price,
      availableCount: Math.max(0, availableCount),
      maxPerUser: t.maxPerUser,
      saleEndsAt: t.saleEndsAt,
      isSoldOut: availableCount <= 0,
    };
  });

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    eventDate: event.eventDate,
    doorsOpenAt: event.doorsOpenAt,
    saleEndsAt: event.saleEndsAt,
    location: event.location,
    status: event.status,
    ticketTypes: types,
  };
}

export async function listTicketTypes(eventId: string) {
  return repo.findAll(eventId);
}

export async function getTicketType(id: string) {
  const type = await repo.findById(id);

  if (!type) {
    throw new NotFoundError('Tipo de entrada no encontrado');
  }

  return type;
}

export async function createTicketType(data: {
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quantityTotal: number;
  maxPerUser?: number;
  saleEndsAt?: string;
}) {
  return repo.create({
    eventId: data.eventId,
    name: data.name,
    description: data.description,
    price: data.price,
    quantityTotal: data.quantityTotal,
    maxPerUser: data.maxPerUser,
    saleEndsAt: data.saleEndsAt ? new Date(data.saleEndsAt) : undefined,
  });
}

export async function updateTicketType(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    quantityTotal?: number;
    maxPerUser?: number;
    isActive?: boolean;
    saleEndsAt?: string | null;
  },
) {
  const existing = await repo.findById(id);

  if (!existing) {
    throw new NotFoundError('Tipo de entrada no encontrado');
  }

  return repo.update(id, {
    ...data,
    saleEndsAt:
      data.saleEndsAt === null
        ? null
        : data.saleEndsAt
          ? new Date(data.saleEndsAt)
          : undefined,
  });
}

export async function deactivateTicketType(id: string) {
  const existing = await repo.findById(id);

  if (!existing) {
    throw new NotFoundError('Tipo de entrada no encontrado');
  }

  return repo.softDelete(id);
}
