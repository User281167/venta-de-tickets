import { ValidationError } from '../../shared/errors/ValidationError.js';
import * as meRepo from './me.repository.js';

export async function getPersonalInfo(userId: string) {
  const user = await meRepo.findByUserId(userId);

  if (!user) {
    return {
      cedula: null,
      fullName: null,
      phone: null,
      address: null,
      dateOfBirth: null,
    };
  }

  return {
    cedula: user.cedula ?? null,
    fullName: user.fullName,
    phone: user.phone ?? null,
    address: user.address ?? null,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().split('T')[0]
      : null,
  };
}

export async function setPersonalInfo(
  userId: string,
  data: Record<string, unknown>,
) {
  const existing = await meRepo.findByUserId(userId);
  const updateData: Record<string, unknown> = {};

  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.dateOfBirth !== undefined) {
    updateData.dateOfBirth = data.dateOfBirth
      ? new Date(data.dateOfBirth as string)
      : null;
  }

  if (data.cedula !== undefined) {
    if (existing?.cedula && data.cedula !== existing.cedula) {
      throw new ValidationError(
        'CEDULA_INVALIDATION',
        'Cedula already set and cannot be modified',
      );
    }

    updateData.cedula = data.cedula;
  }

  const user = await meRepo.upsert(userId, updateData);

  return {
    cedula: user.cedula ?? null,
    fullName: user.fullName,
    phone: user.phone ?? null,
    address: user.address ?? null,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().split('T')[0]
      : null,
  };
}
