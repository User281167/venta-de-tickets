import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

vi.mock('../src/shared/services/auth.service.js', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('../src/modules/surveys/surveys.repository.js', () => ({
  findAllOnboarding: vi.fn(),
}));

const { verifyToken } = await import('../src/shared/services/auth.service.js');

const surveysRepo =
  await import('../src/modules/surveys/surveys.repository.js');

function authHeader(token = 'valid.jwt.token') {
  return { Authorization: `Bearer ${token}` };
}

const mockData = [
  {
    userId: 'u1',
    name: 'Juan Pérez',
    email: 'juan@mail.com',
    answers: [
      { question_id: 'gender', answer: 'Masculino' },
      { question_id: 'occupation', answer: 'Estudiante' },
    ],
    created_at: '2026-06-30T12:00:00.000Z',
  },
  {
    userId: 'u2',
    name: 'María Gómez',
    email: 'maria@mail.com',
    answers: [],
    created_at: null,
  },
];

describe('GET /api/admin/surveys/onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/admin/surveys/onboarding');
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed header', async () => {
    const res = await request(app)
      .get('/api/admin/surveys/onboarding')
      .set('Authorization', 'Basic token');
    expect(res.status).toBe(401);
  });

  it('returns 403 for checker role', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-checker',
      email: 'checker@mail.com',
      role: 'checker',
    });

    const res = await request(app)
      .get('/api/admin/surveys/onboarding')
      .set(authHeader());

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('returns 403 for staff role', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-staff',
      email: 'staff@mail.com',
      role: 'staff',
    });

    const res = await request(app)
      .get('/api/admin/surveys/onboarding')
      .set(authHeader());

    expect(res.status).toBe(403);
  });

  it('returns 200 with data for super_admin', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-admin',
      email: 'admin@mail.com',
      role: 'super_admin',
    });
    vi.mocked(surveysRepo.findAllOnboarding).mockResolvedValue({
      data: mockData,
      total: 2,
      page: 1,
      limit: 20,
    });

    const res = await request(app)
      .get('/api/admin/surveys/onboarding')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe('Juan Pérez');
    expect(res.body.data[1].answers).toEqual([]);
    expect(res.body.total).toBe(2);
    expect(res.body.page).toBe(1);
  });

  it('returns 200 with data for organizer', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-org',
      email: 'org@mail.com',
      role: 'organizer',
    });
    vi.mocked(surveysRepo.findAllOnboarding).mockResolvedValue({
      data: mockData,
      total: 2,
      page: 1,
      limit: 20,
    });

    const res = await request(app)
      .get('/api/admin/surveys/onboarding')
      .set(authHeader());

    expect(res.status).toBe(200);
  });

  it('returns empty data when no users exist', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-admin',
      email: 'admin@mail.com',
      role: 'super_admin',
    });
    vi.mocked(surveysRepo.findAllOnboarding).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const res = await request(app)
      .get('/api/admin/surveys/onboarding')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it('passes page and limit query params', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-admin',
      email: 'admin@mail.com',
      role: 'super_admin',
    });
    vi.mocked(surveysRepo.findAllOnboarding).mockResolvedValue({
      data: [mockData[0]],
      total: 1,
      page: 2,
      limit: 1,
    });

    const res = await request(app)
      .get('/api/admin/surveys/onboarding?page=2&limit=1')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(1);

    expect(surveysRepo.findAllOnboarding).toHaveBeenCalledWith(2, 1);
  });

  it('clamps limit to max 100', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: 'user-admin',
      email: 'admin@mail.com',
      role: 'super_admin',
    });
    vi.mocked(surveysRepo.findAllOnboarding).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
    });

    await request(app)
      .get('/api/admin/surveys/onboarding?limit=999')
      .set(authHeader());

    expect(surveysRepo.findAllOnboarding).toHaveBeenCalledWith(1, 100);
  });
});
