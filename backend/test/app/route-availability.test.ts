import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockVerifyToken, mockGetUserAuthInfo, mockCreateDonation, mockGetCounter, mockUpdateCounter } = vi.hoisted(() => ({
  mockVerifyToken: vi.fn(),
  mockGetUserAuthInfo: vi.fn(),
  mockCreateDonation: vi.fn(),
  mockGetCounter: vi.fn(),
  mockUpdateCounter: vi.fn(),
}));

vi.mock('../../src/shared/services/auth.service.js', () => ({
  verifyToken: mockVerifyToken,
}));

vi.mock('../../src/modules/users/users.service.js', () => ({
  getUserAuthInfo: mockGetUserAuthInfo,
}));

vi.mock('../../src/modules/donaciones/donaciones.service.js', () => ({
  createDonation: mockCreateDonation,
  getCounter: mockGetCounter,
  updateCounter: mockUpdateCounter,
  getStatus: vi.fn(),
  handleWebhook: vi.fn(),
  listDonations: vi.fn(),
}));

import { app } from '../../src/app.js';

const disabledRoutes = [
  ['GET', '/api/tickets'],
  ['GET', '/api/me'],
  ['GET', '/api/users/policies/terms'],
  ['POST', '/api/payments/payments/checkout'],
  ['POST', '/api/admin/tickets'],
  ['POST', '/internal/checkin/scan'],
  ['POST', '/api/confirmations/confirm'],
  ['GET', '/api/audit-log'],
  ['GET', '/api/admin/analytics'],
  ['GET', '/api/admin/users'],
  ['GET', '/api/admin/payments'],
] as const;

describe('API routes for the UTPton campaign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyToken.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'admin',
    });
    mockGetUserAuthInfo.mockResolvedValue({ role: 'admin', isActive: true });
    mockGetCounter.mockResolvedValue({
      currentValue: 250000,
      metaValue: 1000000,
      updatedAt: new Date('2026-10-09T12:00:00.000Z'),
    });
    mockUpdateCounter.mockResolvedValue({
      currentValue: 250000,
      metaValue: 1500000,
      updatedAt: new Date('2026-10-09T12:00:00.000Z'),
    });
  });

  it.each(disabledRoutes)('does not serve %s %s', async (method, path) => {
    const response =
      method === 'GET'
        ? await request(app).get(path).set('Authorization', 'Bearer admin.jwt')
        : await request(app)
            .post(path)
            .set('Authorization', 'Bearer admin.jwt');

    expect(response.status).toBe(404);
  });

  it.each([
    '/api/auth/session',
    '/api/admin/me',
    '/api/admin/donations',
  ])('keeps staff route %s behind authentication', async (path) => {
    const response = await request(app).get(path);

    expect(response.status).toBe(401);
  });

  it('denies the staff session endpoint to regular client accounts', async () => {
    mockVerifyToken.mockResolvedValue({
      id: 'client-1',
      email: 'client@test.com',
      role: 'client',
    });
    mockGetUserAuthInfo.mockResolvedValue({ role: 'client', isActive: true });

    const response = await request(app)
      .get('/api/auth/session')
      .set('Authorization', 'Bearer client.jwt');

    expect(response.status).toBe(403);
  });

  it('keeps the session endpoint available to checker staff', async () => {
    mockVerifyToken.mockResolvedValue({
      id: 'checker-1',
      email: 'checker@test.com',
      role: 'checker',
    });
    mockGetUserAuthInfo.mockResolvedValue({ role: 'checker', isActive: true });

    const response = await request(app)
      .get('/api/auth/session')
      .set('Authorization', 'Bearer checker.jwt');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ role: 'checker' });
  });

  it('keeps counter updates behind authentication', async () => {
    const response = await request(app)
      .put('/api/admin/donations/counter')
      .send({ metaValue: 1000000 });

    expect(response.status).toBe(401);
  });

  it('keeps anonymous UTPton donation creation available', async () => {
    mockCreateDonation.mockResolvedValue({
      initPoint: 'https://payments.test/session',
      sessionId: 'session-1',
    });

    const response = await request(app)
      .post('/api/donaciones')
      .send({
        amountCents: 5000,
        account: 'VICTIMAS',
        backUrl: 'https://frontend.test/donaciones/retorno',
      });

    expect(response.status).toBe(201);
    expect(mockCreateDonation).toHaveBeenCalledWith(
      expect.objectContaining({ account: 'VICTIMAS', provider: 'epayco' }),
    );
  });

  it('keeps the live donation counter endpoint available', async () => {
    const response = await request(app).get('/api/donaciones/counter');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      currentValue: 250000,
      metaValue: 1000000,
    });
  });

  it('keeps authorized admin counter updates available', async () => {
    const response = await request(app)
      .put('/api/admin/donations/counter')
      .set('Authorization', 'Bearer admin.jwt')
      .send({ metaValue: 1500000 });

    expect(response.status).toBe(200);
    expect(response.body.metaValue).toBe(1500000);
    expect(mockUpdateCounter).toHaveBeenCalledWith(
      { metaValue: 1500000 },
      { id: 'admin-1' },
    );
  });
});
