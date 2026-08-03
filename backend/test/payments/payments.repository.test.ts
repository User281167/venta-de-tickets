import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  payment: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
  $executeRaw: vi.fn(),
}));

vi.mock('../../src/shared/database/prisma.client.js', () => ({
  prisma: mockPrisma,
}));

import * as repo from '../../src/modules/payments/payments.repository.js';

describe('payments.repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a pending payment record', async () => {
    mockPrisma.payment.create.mockResolvedValue({
      id: 'payment-1',
      userId: 'user-1',
      provider: 'mercadopago',
      subtotalCents: 25000,
      totalCents: 25000,
      status: 'pending',
    });

    const result = await repo.create({
      userId: 'user-1',
      provider: 'mercadopago',
      subtotalCents: 25000,
      totalCents: 25000,
    });

    expect(mockPrisma.payment.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        provider: 'mercadopago',
        subtotalCents: 25000,
        totalCents: 25000,
        status: 'pending',
      },
    });
    expect(result.id).toBe('payment-1');
  });

  it('updates only provided payment fields', async () => {
    mockPrisma.payment.update.mockResolvedValue({
      id: 'payment-1',
      status: 'completed',
    });

    const result = await repo.update('payment-1', {
      status: 'completed',
      providerTxId: 'provider-123',
      metadata: { source: 'webhook' },
    });

    expect(mockPrisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'payment-1' },
      data: {
        status: 'completed',
        providerTxId: 'provider-123',
        metadata: { source: 'webhook' },
      },
    });
    expect(result.status).toBe('completed');
  });

  it('finds a payment by its universal reference', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 'payment-1',
    });

    const result = await repo.findByReference('payment-1');

    expect(mockPrisma.payment.findUnique).toHaveBeenCalledWith({
      where: { id: 'payment-1' },
    });
    expect(result?.id).toBe('payment-1');
  });

  it('finds a payment with linked tickets', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 'payment-1',
      tickets: [{ id: 'ticket-1' }],
    });

    const result = await repo.findByIdWithTickets('payment-1');

    expect(mockPrisma.payment.findUnique).toHaveBeenCalledWith({
      where: { id: 'payment-1' },
      include: {
        tickets: true,
      },
    });
    expect(result?.tickets).toHaveLength(1);
  });

  it('finds a payment by provider transaction id', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'payment-1',
      providerTxId: 'mp-tx-123',
    });

    const result = await repo.findByProviderTxId('mp-tx-123');

    expect(mockPrisma.payment.findFirst).toHaveBeenCalledWith({
      where: { providerTxId: 'mp-tx-123' },
    });
    expect(result?.providerTxId).toBe('mp-tx-123');
  });

  it('finds all payments with admin select', async () => {
    mockPrisma.payment.findMany.mockResolvedValue([
      {
        id: 'pay-1',
        userId: 'user-1',
        provider: 'mercadopago',
        providerTxId: null,
        subtotalCents: 25000,
        totalCents: 25000,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'user-1', email: 'a@test.com', fullName: 'Alice' },
      },
    ]);

    const result = await repo.findAllPaymentsFiltered({ page: 1, limit: 20 });

    expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          id: true,
          userId: true,
          provider: true,
        }),
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].user.email).toBe('a@test.com');
  });

  it('counts all payments', async () => {
    mockPrisma.payment.count.mockResolvedValue(5);

    const result = await repo.countAllPaymentsFiltered({});

    expect(mockPrisma.payment.count).toHaveBeenCalledWith({ where: {} });
    expect(result).toBe(5);
  });

  it('finds payment by id with user and tickets', async () => {
    const mockPayment = {
      id: 'pay-1',
      userId: 'user-1',
      provider: 'mercadopago',
      subtotalCents: 25000,
      totalCents: 25000,
      status: 'completed',
      user: { id: 'user-1', email: 'a@test.com', fullName: 'Alice' },
      tickets: [
        {
          id: 'ticket-1',
          ticketCode: 'ABC123',
          status: 'paid',
          ticketType: {
            id: 'tt-1',
            name: 'VIP',
            priceCents: 25000,
          },
        },
      ],
    };
    mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);

    const result = await repo.findPaymentByIdWithUser('pay-1');

    expect(mockPrisma.payment.findUnique).toHaveBeenCalledWith({
      where: { id: 'pay-1' },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        tickets: {
          include: {
            ticketType: { select: { id: true, name: true, priceCents: true } },
          },
        },
      },
    });
    expect(result?.user.email).toBe('a@test.com');
    expect(result?.tickets).toHaveLength(1);
  });
});

describe('createAdminPaymentTransaction - sale_ends_at validation', () => {
  const baseInput = {
    userId: 'user-1',
    provider: 'MANUAL',
    subtotalCents: 25000,
    totalCents: 25000,
    createdBy: 'admin-1',
    tickets: [{ ticketTypeId: 'tt-1', quantity: 1, unitPriceCents: 25000 }],
    generateTicketCode: () => 'TKT-001',
  };

  function mockTxWith(queryRawResponses: unknown[][]) {
    const tx = {
      $queryRaw: vi.fn(),
      $executeRaw: vi.fn().mockResolvedValue(0),
    };
    for (const r of queryRawResponses) {
      tx.$queryRaw.mockResolvedValueOnce(r);
    }
    mockPrisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => unknown) => fn(tx),
    );
    return tx;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws TICKET_TYPE_EXPIRED when sale_ends_at is in the past (admin path)', async () => {
    const past = new Date('2020-01-01T00:00:00Z');
    const now = new Date('2026-01-01T00:00:00Z');
    mockTxWith([
      [
        {
          quantity_sold: 0,
          quantity_total: 100,
          name: 'VIP',
          status: 'enabled',
          sale_ends_at: past,
          db_now: now,
          only_egresados: false,
        },
      ],
    ]);

    await expect(repo.createAdminPaymentTransaction(baseInput)).rejects.toMatchObject(
      {
        code: 'TICKET_TYPE_EXPIRED',
        statusCode: 400,
      },
    );

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('throws TICKET_TYPE_EXPIRED when sale_ends_at equals db_now (admin path)', async () => {
    const same = new Date('2026-01-01T00:00:00Z');
    mockTxWith([
      [
        {
          quantity_sold: 0,
          quantity_total: 100,
          name: 'VIP',
          status: 'enabled',
          sale_ends_at: same,
          db_now: same,
          only_egresados: false,
        },
      ],
    ]);

    await expect(repo.createAdminPaymentTransaction(baseInput)).rejects.toMatchObject(
      { code: 'TICKET_TYPE_EXPIRED' },
    );
  });

  it('proceeds when sale_ends_at is null (never expires)', async () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const tx = {
      $queryRaw: vi
        .fn()
        .mockResolvedValueOnce([
          {
            quantity_sold: 0,
            quantity_total: 100,
            name: 'VIP',
            status: 'enabled',
            sale_ends_at: null,
            db_now: now,
            only_egresados: false,
          },
        ])
        .mockResolvedValueOnce([{ id: 'ticket-1' }])
        .mockResolvedValueOnce([{ id: 'payment-1' }]),
      $executeRaw: vi.fn().mockResolvedValue(0),
    };
    mockPrisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => unknown) => fn(tx),
    );

    const result = await repo.createAdminPaymentTransaction(baseInput);

    expect(result.paymentId).toBe('payment-1');
    expect(result.ticketIds).toEqual(['ticket-1']);
  });

  it('proceeds when sale_ends_at is in the future (admin path)', async () => {
    const future = new Date('2099-01-01T00:00:00Z');
    const now = new Date('2026-01-01T00:00:00Z');
    const tx = {
      $queryRaw: vi
        .fn()
        .mockResolvedValueOnce([
          {
            quantity_sold: 0,
            quantity_total: 100,
            name: 'VIP',
            status: 'enabled',
            sale_ends_at: future,
            db_now: now,
            only_egresados: false,
          },
        ])
        .mockResolvedValueOnce([{ id: 'ticket-1' }])
        .mockResolvedValueOnce([{ id: 'payment-1' }]),
      $executeRaw: vi.fn().mockResolvedValue(0),
    };
    mockPrisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => unknown) => fn(tx),
    );

    const result = await repo.createAdminPaymentTransaction(baseInput);

    expect(result.paymentId).toBe('payment-1');
  });

  it('admin bypass: only_egresados=true succeeds for non-egresado user', async () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const tx = {
      $queryRaw: vi
        .fn()
        .mockResolvedValueOnce([
          {
            quantity_sold: 0,
            quantity_total: 100,
            name: 'VIP Egresados',
            status: 'enabled',
            sale_ends_at: null,
            db_now: now,
            only_egresados: true,
          },
        ])
        .mockResolvedValueOnce([{ id: 'ticket-1' }])
        .mockResolvedValueOnce([{ id: 'payment-1' }]),
      $executeRaw: vi.fn().mockResolvedValue(0),
    };
    mockPrisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => unknown) => fn(tx),
    );

    const result = await repo.createAdminPaymentTransaction(baseInput);

    expect(result.paymentId).toBe('payment-1');
  });
});

describe('createCheckoutReservation - sale_ends_at validation (validateAndReserveStock)', () => {
  const baseInput = {
    paymentId: 'payment-1',
    userId: 'user-1',
    provider: 'mercadopago',
    subtotalCents: 25000,
    totalCents: 25000,
    reserveExpiresAt: new Date('2026-01-01T00:10:00Z'),
    userEgresado: false,
    items: [{ ticketTypeId: 'tt-1', quantity: 1, unitPriceCents: 25000 }],
    generateTicketCode: () => 'TKT-001',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws TICKET_TYPE_EXPIRED during checkout reservation when sale_ends_at is past', async () => {
    const past = new Date('2020-01-01T00:00:00Z');
    const now = new Date('2026-01-01T00:00:00Z');
    const tx = {
      $queryRaw: vi
        .fn()
        // sweepExpiredReservationsInternal
        .mockResolvedValueOnce([])
        // validateAndReserveStock
        .mockResolvedValueOnce([
          {
            quantity_sold: 0,
            quantity_total: 100,
            status: 'enabled',
            max_per_user: null,
            sale_ends_at: past,
            db_now: now,
            only_egresados: false,
          },
        ]),
      $executeRaw: vi.fn().mockResolvedValue(0),
    };
    mockPrisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => unknown) => fn(tx),
    );

    await expect(repo.createCheckoutReservation(baseInput)).rejects.toMatchObject(
      { message: 'TICKET_TYPE_EXPIRED', code: 'TICKET_TYPE_EXPIRED' },
    );
  });
});

describe('createCheckoutReservation - only_egresados validation', () => {
  const baseInput = {
    paymentId: 'payment-1',
    userId: 'user-1',
    provider: 'mercadopago',
    subtotalCents: 25000,
    totalCents: 25000,
    reserveExpiresAt: new Date('2026-01-01T00:10:00Z'),
    items: [{ ticketTypeId: 'tt-1', quantity: 1, unitPriceCents: 25000 }],
    generateTicketCode: () => 'TKT-001',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildTx(tt: Record<string, unknown>) {
    return {
      $queryRaw: vi
        .fn()
        .mockResolvedValueOnce([]) // sweep
        .mockResolvedValueOnce([tt]), // validateAndReserveStock
      $executeRaw: vi.fn().mockResolvedValue(0),
    };
  }

  it('throws EGRESADO_ONLY (403) when only_egresados=true and user is not egresado', async () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const tx = buildTx({
      quantity_sold: 0,
      quantity_total: 100,
      status: 'enabled',
      max_per_user: null,
      sale_ends_at: null,
      db_now: now,
      only_egresados: true,
    });
    mockPrisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => unknown) => fn(tx),
    );

    await expect(
      repo.createCheckoutReservation({ ...baseInput, userEgresado: false }),
    ).rejects.toMatchObject({
      message: 'EGRESADO_ONLY',
      code: 'EGRESADO_ONLY',
      statusCode: 403,
    });
  });

  it('proceeds when only_egresados=true and user is egresado', async () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const tx = {
      $queryRaw: vi
        .fn()
        .mockResolvedValueOnce([]) // sweep
        .mockResolvedValueOnce([
          {
            quantity_sold: 0,
            quantity_total: 100,
            status: 'enabled',
            max_per_user: null,
            sale_ends_at: null,
            db_now: now,
            only_egresados: true,
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 'ticket-1',
            ticket_type_id: 'tt-1',
            user_id: 'user-1',
            status: 'reserved',
            reserve_expires_at: baseInput.reserveExpiresAt,
            ticket_code: 'TKT-001',
            payment_id: baseInput.paymentId,
            unit_price_cents: 25000,
          },
        ]),
      $executeRaw: vi.fn().mockResolvedValue(0),
    };
    mockPrisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => unknown) => fn(tx),
    );

    const result = await repo.createCheckoutReservation({
      ...baseInput,
      userEgresado: true,
    });

    expect(result.paymentId).toBe('payment-1');
  });

  it('proceeds when only_egresados=false regardless of user flag', async () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const tx = {
      $queryRaw: vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            quantity_sold: 0,
            quantity_total: 100,
            status: 'enabled',
            max_per_user: null,
            sale_ends_at: null,
            db_now: now,
            only_egresados: false,
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 'ticket-1',
            ticket_type_id: 'tt-1',
            user_id: 'user-1',
            status: 'reserved',
            reserve_expires_at: baseInput.reserveExpiresAt,
            ticket_code: 'TKT-001',
            payment_id: baseInput.paymentId,
            unit_price_cents: 25000,
          },
        ]),
      $executeRaw: vi.fn().mockResolvedValue(0),
    };
    mockPrisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => unknown) => fn(tx),
    );

    const result = await repo.createCheckoutReservation({
      ...baseInput,
      userEgresado: false,
    });

    expect(result.paymentId).toBe('payment-1');
  });
});
