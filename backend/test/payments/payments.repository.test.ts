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
      amountCents: 25000,
      status: 'pending',
    });

    const result = await repo.create({
      userId: 'user-1',
      provider: 'mercadopago',
      amountCents: 25000,
    });

    expect(mockPrisma.payment.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        provider: 'mercadopago',
        amountCents: 25000,
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
        amountCents: 25000,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'user-1', email: 'a@test.com', fullName: 'Alice' },
      },
    ]);

    const result = await repo.findAllPayments(1, 20);

    expect(mockPrisma.payment.findMany).toHaveBeenCalledWith({
      select: expect.objectContaining({
        id: true,
        userId: true,
        provider: true,
      }),
      skip: 0,
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toHaveLength(1);
    expect(result[0].user.email).toBe('a@test.com');
  });

  it('counts all payments', async () => {
    mockPrisma.payment.count.mockResolvedValue(5);

    const result = await repo.countAllPayments();

    expect(mockPrisma.payment.count).toHaveBeenCalledWith();
    expect(result).toBe(5);
  });

  it('finds payment by id with user and tickets', async () => {
    const mockPayment = {
      id: 'pay-1',
      userId: 'user-1',
      provider: 'mercadopago',
      amountCents: 25000,
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
            price: 25000,
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
            ticketType: { select: { id: true, name: true, price: true } },
          },
        },
      },
    });
    expect(result?.user.email).toBe('a@test.com');
    expect(result?.tickets).toHaveLength(1);
  });
});
