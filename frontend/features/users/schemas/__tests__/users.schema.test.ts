import { describe, it, expect } from 'vitest';
import { updateUserSchema } from '../users.schema';

describe('updateUserSchema', () => {
  it('accepts valid fullName and phone', () => {
    const result = updateUserSchema.safeParse({
      fullName: 'Juan Pérez',
      phone: '3001234567',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid fullName with null phone', () => {
    const result = updateUserSchema.safeParse({
      fullName: 'Juan Pérez',
      phone: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid fullName with undefined phone', () => {
    const result = updateUserSchema.safeParse({
      fullName: 'Juan Pérez',
    });
    expect(result.success).toBe(true);
  });

  it('preprocesses empty string phone to null', () => {
    const result = updateUserSchema.safeParse({
      fullName: 'Juan Pérez',
      phone: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeNull();
    }
  });

  it('rejects empty fullName', () => {
    const result = updateUserSchema.safeParse({
      fullName: '',
      phone: null,
    });
    expect(result.success).toBe(false);
  });

  it('rejects phone shorter than 10 chars', () => {
    const result = updateUserSchema.safeParse({
      fullName: 'Juan Pérez',
      phone: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('rejects phone longer than 20 chars', () => {
    const result = updateUserSchema.safeParse({
      fullName: 'Juan Pérez',
      phone: '1'.repeat(21),
    });
    expect(result.success).toBe(false);
  });

  it('accepts all fields including cedula, address, dateOfBirth', () => {
    const result = updateUserSchema.safeParse({
      fullName: 'Juan Pérez',
      phone: '3001234567',
      cedula: '12345678',
      address: 'Calle 123',
      dateOfBirth: '1990-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid cedula with 8 digits', () => {
    const result = updateUserSchema.safeParse({
      cedula: '12345678',
    });
    expect(result.success).toBe(true);
  });

  it('rejects cedula with less than 8 digits', () => {
    const result = updateUserSchema.safeParse({
      cedula: '1234567',
    });
    expect(result.success).toBe(false);
  });

  it('rejects cedula with more than 15 digits', () => {
    const result = updateUserSchema.safeParse({
      cedula: '1'.repeat(16),
    });
    expect(result.success).toBe(false);
  });

  it('rejects cedula with non-numeric characters', () => {
    const result = updateUserSchema.safeParse({
      cedula: '1234567a',
    });
    expect(result.success).toBe(false);
  });

  it('preprocesses empty string dateOfBirth to null', () => {
    const result = updateUserSchema.safeParse({
      dateOfBirth: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dateOfBirth).toBeNull();
    }
  });

  it('rejects unknown fields', () => {
    const result = updateUserSchema.safeParse({
      fullName: 'Juan Pérez',
      unknownField: 'value',
    });
    expect(result.success).toBe(false);
  });
});
