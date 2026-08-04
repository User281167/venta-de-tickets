import type { Payment } from '@prisma/client';

import { findByIdWithTickets } from './payments.repository.queries.js';

export * from './payments.repository.queries.js';
export * from './payments.repository.checkout.js';
export * from './payments.repository.webhook.js';
export * from './payments.repository.admin.js';

export type PaymentWithTickets = NonNullable<
  Awaited<ReturnType<typeof findByIdWithTickets>>
>;

export type PaymentRow = Payment;
