import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

vi.mock('../src/shared/services/auth.service.js', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('../src/shared/services/role-resolver.js', () => ({
  resolveRole: vi.fn(),
}));

vi.mock('../src/modules/admins/admins.repository.js', () => ({
  findAll: vi.fn(),
  countAll: vi.fn(),
  findByCedula: vi.fn(),
  findById: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
  updateRole: vi.fn(),
  findConflicts: vi.fn(),
}));

vi.mock('../src/shared/supabase/admin-client.js', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: vi.fn(),
        updateUserById: vi.fn(),
        deleteUser: vi.fn(),
      },
    },
  },
}));

vi.mock('../src/modules/payments/payments.repository.js', () => ({
  findAllPaymentsFiltered: vi.fn(),
  countAllPaymentsFiltered: vi.fn(),
  findPaymentByIdWithUser: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  findByProviderTxId: vi.fn(),
  findByReference: vi.fn(),
  findByIdWithTickets: vi.fn(),
  findAllByUserId: vi.fn(),
  countByUserId: vi.fn(),
  createCheckoutTransaction: vi.fn(),
  processPaymentWebhook: vi.fn(),
  updateTicketQrToken: vi.fn(),
}));

vi.mock('../src/modules/tickets/tickets.repository.js', () => ({
  findById: vi.fn(),
  createAdminSale: vi.fn(),
  updateQrToken: vi.fn(),
}));

const { verifyToken } = await import('../src/shared/services/auth.service.js');
const { resolveRole } = await import('../src/shared/services/role-resolver.js');
const adminsRepo = await import('../src/modules/admins/admins.repository.js');
const { supabaseAdmin } =
  await import('../src/shared/supabase/admin-client.js');
const paymentsRepo = await import('../src/modules/payments/payments.repository.js');
const ticketsRepo = await import('../src/modules/tickets/tickets.repository.js');

function authHeader(token = 'valid.jwt.token') {
  return { Authorization: `Bearer ${token}` };
}

function mockAdminAuth() {
  vi.mocked(resolveRole).mockResolvedValue('admin');
  vi.mocked(verifyToken).mockResolvedValue({
    id: 'admin-123',
    email: 'admin@example.com',
    role: 'admin',
  });
}

function mockRoleAuth(role: string) {
  vi.mocked(resolveRole).mockResolvedValue(role);
  vi.mocked(verifyToken).mockResolvedValue({
    id: `user-${role}`,
    email: `${role}@test.com`,
    role,
  });
}

const mockUserList = [
  {
    id: 'u1',
    email: 'a@test.com',
    fullName: 'Alice',
    phone: '3001111111',
    cedula: '11111111',
    role: 'client',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u2',
    email: 'b@test.com',
    fullName: 'Bob',
    phone: '3002222222',
    cedula: '22222222',
    role: 'checker',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const mockCreatedUser = {
  id: 'new-user-id',
  email: 'new@test.com',
  fullName: 'New User',
  phone: '3003333333',
  cedula: '33333333',
  role: 'client',
  isActive: true,
  createdAt: new Date().toISOString(),
};

const mockExistingUser = {
  id: 'existing-id',
  email: 'existing@test.com',
  role: 'client',
  cedula: '44444444',
  phone: '3004444444',
  isActive: true,
  fullName: 'Existing User',
};

describe('Auth & role guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/admin/users returns 401 without auth', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/users returns 403 for checker role', async () => {
    mockRoleAuth('checker');

    const res = await request(app).get('/api/admin/users').set(authHeader());
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('GET /api/admin/users returns 403 for client role', async () => {
    mockRoleAuth('client');

    const res = await request(app).get('/api/admin/users').set(authHeader());
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('GET /api/admin/me returns 200 with admin profile', async () => {
    mockAdminAuth();

    const res = await request(app).get('/api/admin/me').set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 'admin-123',
      email: 'admin@example.com',
      role: 'admin',
    });
  });
});

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 200 with paginated list', async () => {
    vi.mocked(adminsRepo.findAll).mockResolvedValue(mockUserList);
    vi.mocked(adminsRepo.countAll).mockResolvedValue(2);

    const res = await request(app).get('/api/admin/users').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.total).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(20);
  });

  it('passes search param to repository', async () => {
    vi.mocked(adminsRepo.findAll).mockResolvedValue([mockUserList[0]]);
    vi.mocked(adminsRepo.countAll).mockResolvedValue(1);

    await request(app).get('/api/admin/users?search=Alice').set(authHeader());

    expect(adminsRepo.findAll).toHaveBeenCalledWith(1, 20, 'Alice');
    expect(adminsRepo.countAll).toHaveBeenCalledWith('Alice');
  });

  it('passes pagination params correctly', async () => {
    vi.mocked(adminsRepo.findAll).mockResolvedValue([mockUserList[1]]);
    vi.mocked(adminsRepo.countAll).mockResolvedValue(1);

    const res = await request(app)
      .get('/api/admin/users?page=2&limit=10')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(10);
    expect(adminsRepo.findAll).toHaveBeenCalledWith(2, 10, undefined);
  });
});

describe('POST /api/admin/users (create individual)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 422 with empty body', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set(authHeader())
      .send({});
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 with invalid email', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set(authHeader())
      .send({
        email: 'not-an-email',
        password: 'password123',
        fullName: 'Test User',
      });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 with short password (< 6 chars)', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set(authHeader())
      .send({
        email: 'test@test.com',
        password: '123',
        fullName: 'Test User',
      });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 409 CONFLICT when email already exists', async () => {
    vi.mocked(supabaseAdmin.auth.admin.createUser).mockResolvedValue({
      error: null,
      data: { user: { id: 'new-user-id' } },
    });
    vi.mocked(adminsRepo.upsert).mockRejectedValue(
      Object.assign(new Error('Unique constraint'), { code: 'P2002' }),
    );
    vi.mocked(supabaseAdmin.auth.admin.deleteUser).mockResolvedValue({
      data: null,
      error: null,
    });

    const res = await request(app)
      .post('/api/admin/users')
      .set(authHeader())
      .send({
        email: 'exists@test.com',
        password: 'password123',
        fullName: 'Test User',
      });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('returns 409 CONFLICT when cedula already exists', async () => {
    vi.mocked(supabaseAdmin.auth.admin.createUser).mockResolvedValue({
      error: null,
      data: { user: { id: 'new-user-id' } },
    });
    vi.mocked(adminsRepo.upsert).mockRejectedValue(
      Object.assign(new Error('Unique constraint'), { code: 'P2002' }),
    );
    vi.mocked(supabaseAdmin.auth.admin.deleteUser).mockResolvedValue({
      data: null,
      error: null,
    });

    const res = await request(app)
      .post('/api/admin/users')
      .set(authHeader())
      .send({
        email: 'new@test.com',
        password: 'password123',
        fullName: 'Test User',
        cedula: '12345678',
      });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('returns 502 AUTH_ERROR when Supabase user creation fails', async () => {
    vi.mocked(supabaseAdmin.auth.admin.createUser).mockResolvedValue({
      error: { message: 'User already registered' },
      data: null,
    });

    const res = await request(app)
      .post('/api/admin/users')
      .set(authHeader())
      .send({
        email: 'fail@test.com',
        password: 'password123',
        fullName: 'Fail User',
      });
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('AUTH_ERROR');
  });

  it('returns 201 with user when valid data provided', async () => {
    vi.mocked(supabaseAdmin.auth.admin.createUser).mockResolvedValue({
      error: null,
      data: { user: { id: 'new-user-id' } },
    });
    vi.mocked(adminsRepo.upsert).mockResolvedValue(mockCreatedUser);

    const res = await request(app)
      .post('/api/admin/users')
      .set(authHeader())
      .send({
        email: 'new@test.com',
        password: 'password123',
        fullName: 'New User',
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('new@test.com');
    expect(res.body.fullName).toBe('New User');
  });
});

describe('POST /api/admin/users/batch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 422 with empty array (min 1)', async () => {
    const res = await request(app)
      .post('/api/admin/users/batch')
      .set(authHeader())
      .send([]);
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 with 51 users (max 50)', async () => {
    const users = Array.from({ length: 51 }, (_, i) => ({
      email: `user${i}@test.com`,
      password: 'password123',
      fullName: `User ${i}`,
    }));

    const res = await request(app)
      .post('/api/admin/users/batch')
      .set(authHeader())
      .send(users);
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 409 CONFLICT when any email already exists', async () => {
    vi.mocked(adminsRepo.findConflicts).mockResolvedValue([
      { email: 'conflict@test.com', cedula: null },
    ]);

    const res = await request(app)
      .post('/api/admin/users/batch')
      .set(authHeader())
      .send([
        { email: 'ok@test.com', password: 'pass123', fullName: 'Ok' },
        {
          email: 'conflict@test.com',
          password: 'pass123',
          fullName: 'Conflict',
        },
      ]);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
    expect(res.body.error.data.emails).toContain('conflict@test.com');
  });

  it('returns 409 CONFLICT when any cedula already exists', async () => {
    vi.mocked(adminsRepo.findConflicts).mockResolvedValue([
      { email: null, cedula: '99999999' },
    ]);

    const res = await request(app)
      .post('/api/admin/users/batch')
      .set(authHeader())
      .send([
        {
          email: 'a@test.com',
          password: 'pass123',
          fullName: 'A',
          cedula: '11111111',
        },
        {
          email: 'b@test.com',
          password: 'pass123',
          fullName: 'B',
          cedula: '99999999',
        },
      ]);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
    expect(res.body.error.data.cedulas).toContain('99999999');
  });

  it('returns 201 with array when all valid', async () => {
    vi.mocked(adminsRepo.findConflicts).mockResolvedValue([]);
    vi.mocked(supabaseAdmin.auth.admin.createUser).mockResolvedValue({
      error: null,
      data: { user: { id: 'new-id' } },
    });
    vi.mocked(adminsRepo.upsert).mockResolvedValue(mockCreatedUser);

    const res = await request(app)
      .post('/api/admin/users/batch')
      .set(authHeader())
      .send([
        {
          email: 'new@test.com',
          password: 'password123',
          fullName: 'New User',
        },
      ]);

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PATCH /api/admin/users/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 422 with empty body (at least one field required)', async () => {
    vi.mocked(adminsRepo.findById).mockResolvedValue(mockExistingUser);

    const res = await request(app)
      .patch('/api/admin/users/123')
      .set(authHeader())
      .send({});
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 NOT_FOUND when user does not exist', async () => {
    vi.mocked(adminsRepo.findById).mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/admin/users/999')
      .set(authHeader())
      .send({ fullName: 'New' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 409 CONFLICT when cedula already in use by different user', async () => {
    vi.mocked(adminsRepo.findById).mockResolvedValue(mockExistingUser);
    vi.mocked(adminsRepo.findByCedula).mockResolvedValue({
      id: 'other-user',
      cedula: '55555555',
    });

    const res = await request(app)
      .patch('/api/admin/users/existing-id')
      .set(authHeader())
      .send({ cedula: '55555555' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('returns 422 VALIDATION_ERROR when role is super_admin', async () => {
    vi.mocked(adminsRepo.findById).mockResolvedValue(mockExistingUser);

    const res = await request(app)
      .patch('/api/admin/users/existing-id')
      .set(authHeader())
      .send({ role: 'super_admin' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 200 when updating fullName', async () => {
    vi.mocked(adminsRepo.findById).mockResolvedValue(mockExistingUser);
    vi.mocked(adminsRepo.update).mockResolvedValue({
      ...mockCreatedUser,
      fullName: 'Updated Name',
    });

    const res = await request(app)
      .patch('/api/admin/users/existing-id')
      .set(authHeader())
      .send({ fullName: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe('Updated Name');
  });

  it('returns 200 when updating role to checker', async () => {
    vi.mocked(adminsRepo.findById).mockResolvedValue(mockExistingUser);
    vi.mocked(supabaseAdmin.auth.admin.updateUserById).mockResolvedValue({
      data: { user: {} },
      error: null,
    });
    vi.mocked(adminsRepo.update).mockResolvedValue({
      ...mockCreatedUser,
      role: 'checker',
    });

    const res = await request(app)
      .patch('/api/admin/users/existing-id')
      .set(authHeader())
      .send({ role: 'checker' });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('checker');
    expect(supabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith(
      'existing-id',
      { app_metadata: { role: 'checker' } },
    );
  });

  it('returns 200 when updating isActive', async () => {
    vi.mocked(adminsRepo.findById).mockResolvedValue(mockExistingUser);
    vi.mocked(adminsRepo.update).mockResolvedValue({
      ...mockCreatedUser,
      isActive: false,
    });

    const res = await request(app)
      .patch('/api/admin/users/existing-id')
      .set(authHeader())
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(false);
  });

  it('returns 200 when same user updates own cedula', async () => {
    vi.mocked(adminsRepo.findById).mockResolvedValue(mockExistingUser);
    vi.mocked(adminsRepo.findByCedula).mockResolvedValue({
      id: 'existing-id',
      cedula: '44444444',
    });

    vi.mocked(adminsRepo.update).mockResolvedValue({
      ...mockCreatedUser,
      cedula: '44444444',
    });

    const res = await request(app)
      .patch('/api/admin/users/existing-id')
      .set(authHeader())
      .send({ cedula: '44444444' });
    expect(res.status).toBe(200);
  });
});

describe('GET /api/admin/payments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  const mockPaymentList = [
    {
      id: 'pay-1',
      userId: 'user-1',
      provider: 'mercadopago',
      providerTxId: null,
      amountCents: 25000,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { id: 'user-1', email: 'a@test.com', fullName: 'Alice' },
      _count: { tickets: 2 },
    },
    {
      id: 'pay-2',
      userId: 'user-2',
      provider: 'mercadopago',
      providerTxId: 'mp-123',
      amountCents: 15000,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { id: 'user-2', email: 'b@test.com', fullName: 'Bob' },
      _count: { tickets: 1 },
    },
  ];

  it('returns 200 with paginated list', async () => {
    vi.mocked(paymentsRepo.findAllPaymentsFiltered).mockResolvedValue(mockPaymentList);
    vi.mocked(paymentsRepo.countAllPaymentsFiltered).mockResolvedValue(2);

    const res = await request(app).get('/api/admin/payments').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.total).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(25);
    expect(res.body.data[0].user.email).toBe('a@test.com');
  });

  it('passes pagination params correctly', async () => {
    vi.mocked(paymentsRepo.findAllPaymentsFiltered).mockResolvedValue([mockPaymentList[1]]);
    vi.mocked(paymentsRepo.countAllPaymentsFiltered).mockResolvedValue(1);

    const res = await request(app)
      .get('/api/admin/payments?page=2&limit=5')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(5);
    expect(paymentsRepo.findAllPaymentsFiltered).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
    });
  });

  it('returns 422 with invalid page param', async () => {
    const res = await request(app)
      .get('/api/admin/payments?page=-1')
      .set(authHeader());

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/admin/payments/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  const mockPaymentDetail = {
    id: 'pay-1',
    userId: 'user-1',
    provider: 'mercadopago',
    providerTxId: null,
    amountCents: 25000,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: { id: 'user-1', email: 'a@test.com', fullName: 'Alice' },
    tickets: [
      {
        id: 'ticket-1',
        ticketCode: 'ABC123',
        status: 'paid',
        ticketType: { id: 'tt-1', name: 'VIP', price: 25000 },
      },
    ],
  };

  it('returns 200 with payment detail', async () => {
    vi.mocked(paymentsRepo.findPaymentByIdWithUser).mockResolvedValue(mockPaymentDetail);

    const res = await request(app)
      .get('/api/admin/payments/11111111-1111-4111-a111-111111111111')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('pay-1');
    expect(res.body.user.email).toBe('a@test.com');
    expect(res.body.tickets).toHaveLength(1);
  });

  it('returns 404 when payment not found', async () => {
    vi.mocked(paymentsRepo.findPaymentByIdWithUser).mockResolvedValue(null);

    const res = await request(app)
      .get('/api/admin/payments/00000000-0000-0000-0000-000000000000')
      .set(authHeader());

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 422 with invalid uuid param', async () => {
    const res = await request(app)
      .get('/api/admin/payments/not-a-uuid')
      .set(authHeader());

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/admin/sales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  const mockTicketType = {
    id: 'tt-1',
    name: 'VIP',
    description: null,
    price: 50000,
    quantityTotal: 100,
    quantitySold: 5,
    maxPerUser: null,
    saleEndsAt: null,
    status: 'enabled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const VALID_UUID = '11111111-1111-4111-a111-111111111111';

  it('returns 201 with ticket ids on success', async () => {
    vi.mocked(ticketsRepo.findById).mockResolvedValue(mockTicketType);
    vi.mocked(adminsRepo.findById).mockResolvedValue(mockExistingUser);
    vi.mocked(ticketsRepo.createAdminSale).mockResolvedValue(['ticket-1', 'ticket-2']);
    vi.mocked(ticketsRepo.updateQrToken).mockResolvedValue({} as any);

    const res = await request(app)
      .post('/api/admin/sales')
      .set(authHeader())
      .send({ userId: VALID_UUID, ticketTypeId: VALID_UUID, quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.ticketIds).toEqual(['ticket-1', 'ticket-2']);
  });

  it('returns 422 with empty body', async () => {
    const res = await request(app)
      .post('/api/admin/sales')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 with invalid uuid', async () => {
    const res = await request(app)
      .post('/api/admin/sales')
      .set(authHeader())
      .send({ userId: 'not-a-uuid', ticketTypeId: VALID_UUID, quantity: 1 });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 with quantity 0', async () => {
    const res = await request(app)
      .post('/api/admin/sales')
      .set(authHeader())
      .send({ userId: VALID_UUID, ticketTypeId: VALID_UUID, quantity: 0 });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when user not found', async () => {
    vi.mocked(ticketsRepo.findById).mockResolvedValue(mockTicketType);
    vi.mocked(adminsRepo.findById).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/admin/sales')
      .set(authHeader())
      .send({ userId: VALID_UUID, ticketTypeId: VALID_UUID, quantity: 1 });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 404 when ticket type not found', async () => {
    vi.mocked(ticketsRepo.findById).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/admin/sales')
      .set(authHeader())
      .send({ userId: VALID_UUID, ticketTypeId: VALID_UUID, quantity: 1 });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 409 when insufficient stock', async () => {
    vi.mocked(ticketsRepo.findById).mockResolvedValue(mockTicketType);
    vi.mocked(adminsRepo.findById).mockResolvedValue(mockExistingUser);
    vi.mocked(ticketsRepo.createAdminSale).mockRejectedValue(
      Object.assign(new Error('Insufficient stock'), { statusCode: 409, code: 'SOLD_OUT' }),
    );

    const res = await request(app)
      .post('/api/admin/sales')
      .set(authHeader())
      .send({ userId: VALID_UUID, ticketTypeId: VALID_UUID, quantity: 999 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('SOLD_OUT');
  });

  it('returns 403 for checker role', async () => {
    mockRoleAuth('checker');

    const res = await request(app)
      .post('/api/admin/sales')
      .set(authHeader())
      .send({ userId: VALID_UUID, ticketTypeId: VALID_UUID, quantity: 1 });

    expect(res.status).toBe(403);
  });
});
