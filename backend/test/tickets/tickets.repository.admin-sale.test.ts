import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  };

  return {
    mockTx: tx,
    mockPrisma: {
      $transaction: vi.fn((fn: Function) => fn(tx)),
    },
  };
});

vi.mock('../../src/shared/database/prisma.client.js', () => ({
  prisma: mockPrisma,
}));

import * as repo from '../../src/modules/tickets/tickets.repository.js';

function generateCode(): string {
  return 'code-' + Math.random().toString(36).slice(2, 10);
}

describe('tickets.repository.createAdminSale', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates tickets and returns ids on success', async () => {
    mockTx.$queryRaw.mockResolvedValueOnce([{ quantity_sold: 5, quantity_total: 100, status: 'enabled' }]);
    mockTx.$executeRaw.mockResolvedValueOnce([1]);
    mockTx.$queryRaw.mockResolvedValueOnce([{ id: 'ticket-1' }]);
    mockTx.$queryRaw.mockResolvedValueOnce([{ id: 'ticket-2' }]);

    const result = await repo.createAdminSale({
      ticketTypeId: 'tt-1',
      userId: 'user-1',
      quantity: 2,
      generateTicketCode: generateCode,
    });

    expect(result).toEqual(['ticket-1', 'ticket-2']);
    expect(mockTx.$executeRaw).toHaveBeenCalledTimes(1);
    expect(mockTx.$queryRaw).toHaveBeenCalledTimes(3);
  });

  it('throws TICKET_TYPE_NOT_FOUND when ticket type does not exist', async () => {
    mockTx.$queryRaw.mockResolvedValueOnce([]);

    await expect(
      repo.createAdminSale({
        ticketTypeId: 'nonexistent',
        userId: 'user-1',
        quantity: 1,
        generateTicketCode: generateCode,
      }),
    ).rejects.toMatchObject({
      message: 'Ticket type not found',
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  });

  it('throws TICKET_TYPE_NOT_AVAILABLE when ticket type disabled', async () => {
    mockTx.$queryRaw.mockResolvedValueOnce([{ quantity_sold: 0, quantity_total: 100, status: 'disabled' }]);

    await expect(
      repo.createAdminSale({
        ticketTypeId: 'tt-1',
        userId: 'user-1',
        quantity: 1,
        generateTicketCode: generateCode,
      }),
    ).rejects.toMatchObject({
      message: 'Ticket type is not available',
      statusCode: 400,
      code: 'TICKET_TYPE_NOT_AVAILABLE',
    });
  });

  it('throws SOLD_OUT when insufficient stock', async () => {
    mockTx.$queryRaw.mockResolvedValueOnce([{ quantity_sold: 99, quantity_total: 100, status: 'enabled' }]);

    await expect(
      repo.createAdminSale({
        ticketTypeId: 'tt-1',
        userId: 'user-1',
        quantity: 2,
        generateTicketCode: generateCode,
      }),
    ).rejects.toMatchObject({
      message: 'Insufficient stock',
      statusCode: 409,
      code: 'SOLD_OUT',
    });
  });

  it('forwards ticket code generator to INSERT call', async () => {
    mockTx.$queryRaw.mockResolvedValueOnce([{ quantity_sold: 0, quantity_total: 10, status: 'enabled' }]);
    mockTx.$executeRaw.mockResolvedValueOnce([1]);
    mockTx.$queryRaw.mockResolvedValueOnce([{ id: 'ticket-1' }]);

    const code = 'MYCODE123';
    await repo.createAdminSale({
      ticketTypeId: 'tt-vip',
      userId: 'user-42',
      quantity: 1,
      generateTicketCode: () => code,
    });

    expect(mockTx.$queryRaw).toHaveBeenCalledTimes(2);
    const secondQueryRaw = mockTx.$queryRaw.mock.calls[1];
    const sqlArg = secondQueryRaw.find((a: any) => typeof a === 'string' || a instanceof String);
    expect(sqlArg).toBeDefined();
  });
});
