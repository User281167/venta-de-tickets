import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../auth.schema';

describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'mypassword',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'mypassword',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    email: 'user@example.com',
    password: 'longenough',
    confirmPassword: 'longenough',
    consentGiven: true as const,
  };

  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'bad' });
    expect(result.success).toBe(false);
  });

  it('rejects short password (< 8 chars)', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'short', confirmPassword: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: 'different' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'confirmPassword');
      expect(issue?.message).toBe('Las contraseñas no coinciden');
    }
  });

  it('rejects consent not given', () => {
    const result = registerSchema.safeParse({ ...valid, consentGiven: false });
    expect(result.success).toBe(false);
  });

  it('rejects consent literal true check with boolean true', () => {
    const result = registerSchema.safeParse({ ...valid, consentGiven: true });
    expect(result.success).toBe(true);
  });
});
