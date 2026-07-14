import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

const mockPreferenceCreate = vi.hoisted(() => vi.fn());
const mockPaymentGet = vi.hoisted(() => vi.fn());
const mockValidate = vi.hoisted(() => vi.fn());

vi.mock('mercadopago', () => ({
  MercadoPagoConfig: vi.fn(),
  Preference: function () {
    return { create: mockPreferenceCreate };
  },
  Payment: function () {
    return { get: mockPaymentGet };
  },
  WebhookSignatureValidator: {
    validate: mockValidate,
  },
}));

vi.mock('../../src/modules/payments/payments.repository.js', () => ({
  createCheckoutTransaction: vi.fn(),
  processPaymentWebhook: vi.fn(),
  findByIdWithTickets: vi.fn(),
  findByReference: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  createAdminPaymentTransaction: vi.fn(),
  refundTransaction: vi.fn(),
  findAllByUserId: vi.fn(),
  countByUserId: vi.fn(),
  findAllPaymentsFiltered: vi.fn(),
  countAllPaymentsFiltered: vi.fn(),
  findPaymentByIdWithUser: vi.fn(),
  findByProviderTxId: vi.fn(),
}));

vi.mock('../../src/modules/tickets/tickets.service.js', () => ({
  getTicketTypeById: vi.fn(),
  generateQrForTicket: vi.fn(),
}));

const paymentsRepo = await import('../../src/modules/payments/payments.repository.js');
const ticketsService = await import('../../src/modules/tickets/tickets.service.js');

describe('POST /api/payments/webhook/:provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidate.mockImplementation(() => undefined);
  });

  it('processes approved webhook and updates payment', async () => {
    mockPaymentGet.mockResolvedValue({
      external_reference: 'pay-123',
      status: 'approved',
      id: 99999,
    });

    vi.mocked(paymentsRepo.findByReference).mockResolvedValue({
      id: 'pay-123',
      status: 'pending',
      provider: 'mercadopago',
    });
    vi.mocked(paymentsRepo.processPaymentWebhook).mockResolvedValue({
      processed: true,
    });
    vi.mocked(paymentsRepo.findByIdWithTickets).mockResolvedValue({
      id: 'pay-123',
      tickets: [{ id: 'ticket-1' }, { id: 'ticket-2' }],
    });

    const res = await request(app)
      .post('/api/payments/webhook/mercadopago')
      .send({
        type: 'payment',
        data: { id: '99999' },
      })
      .set('x-signature', 'ts=123,v1=valid')
      .set('x-request-id', 'req-999');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(paymentsRepo.processPaymentWebhook).toHaveBeenCalled();
    expect(ticketsService.generateQrForTicket).toHaveBeenCalledTimes(2);
  });

  it('marks payment as failed when webhook status is declined', async () => {
    mockPaymentGet.mockResolvedValue({
      external_reference: 'pay-456',
      status: 'rejected',
      id: 88888,
    });

    vi.mocked(paymentsRepo.findByReference).mockResolvedValue({
      id: 'pay-456',
      status: 'pending',
      provider: 'mercadopago',
    });

    const res = await request(app)
      .post('/api/payments/webhook/mercadopago')
      .send({
        type: 'payment',
        data: { id: '88888' },
      })
      .set('x-signature', 'ts=123,v1=valid')
      .set('x-request-id', 'req-888');

    expect(res.status).toBe(200);
    expect(paymentsRepo.update).toHaveBeenCalledWith('pay-456', {
      status: 'failed',
    });
    expect(paymentsRepo.processPaymentWebhook).not.toHaveBeenCalled();
  });

  it('returns 200 but skips processing when payment is already completed', async () => {
    mockPaymentGet.mockResolvedValue({
      external_reference: 'pay-789',
      status: 'approved',
      id: 77777,
    });

    vi.mocked(paymentsRepo.findByReference).mockResolvedValue({
      id: 'pay-789',
      status: 'completed',
      provider: 'mercadopago',
    });

    const res = await request(app)
      .post('/api/payments/webhook/mercadopago')
      .send({
        type: 'payment',
        data: { id: '77777' },
      })
      .set('x-signature', 'ts=123,v1=valid')
      .set('x-request-id', 'req-777');

    expect(res.status).toBe(200);
    expect(paymentsRepo.processPaymentWebhook).not.toHaveBeenCalled();
  });
});
