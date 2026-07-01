import { describe, it, expect } from 'vitest';
import {
  paginationSchema,
  updateRoleSchema,
} from '../src/modules/admins/admins.validators.js';
import { onboardingSurveySchema } from '../src/modules/surveys/surveys.validators.js';

describe('paginationSchema', () => {
  it('accepts valid page and limit', () => {
    const result = paginationSchema.safeParse({ page: '1', limit: '20' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('defaults page to 1 when missing', () => {
    const result = paginationSchema.safeParse({ limit: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
    }
  });

  it('defaults limit to 20 when missing', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
    }
  });

  it('rejects page less than 1', () => {
    const result = paginationSchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects limit over 100', () => {
    const result = paginationSchema.safeParse({ page: '1', limit: '101' });
    expect(result.success).toBe(false);
  });

  it('rejects limit less than 1', () => {
    const result = paginationSchema.safeParse({ page: '1', limit: '0' });
    expect(result.success).toBe(false);
  });

  it('accepts optional search string', () => {
    const result = paginationSchema.safeParse({ search: 'juan' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe('juan');
    }
  });
});

describe('updateRoleSchema', () => {
  it('accepts valid role values', () => {
    const roles = ['super_admin', 'organizer', 'staff', 'checker'];
    for (const role of roles) {
      const result = updateRoleSchema.safeParse({ role });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid role value', () => {
    const result = updateRoleSchema.safeParse({ role: 'invalid_role' });
    expect(result.success).toBe(false);
  });

  it('rejects empty role', () => {
    const result = updateRoleSchema.safeParse({ role: '' });
    expect(result.success).toBe(false);
  });
});

describe('onboardingSurveySchema', () => {
  it('accepts valid responses', () => {
    const result = onboardingSurveySchema.safeParse({
      responses: [
        { question_id: 'gender', answer: 'Masculino' },
        { question_id: 'how_heard', answer: ['Redes sociales'] },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty responses array (skip)', () => {
    const result = onboardingSurveySchema.safeParse({ responses: [] });
    expect(result.success).toBe(true);
  });

  it('rejects missing question_id', () => {
    const result = onboardingSurveySchema.safeParse({
      responses: [{ answer: 'Masculino' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects null answer', () => {
    const result = onboardingSurveySchema.safeParse({
      responses: [{ question_id: 'gender', answer: null }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects numeric answer (must be string or array)', () => {
    const result = onboardingSurveySchema.safeParse({
      responses: [{ question_id: 'gender', answer: 123 }],
    });
    expect(result.success).toBe(false);
  });
});
