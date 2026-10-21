import {
  findRegister,
  putRegister,
  updateRegisterConfirmation,
} from './register.repository.js';
import { RegisterInput } from './register.schema.js';

export async function register(data: RegisterInput): Promise<void> {
  await putRegister(data);
}

export async function getRegisterEvent(cedula: string) {
  return findRegister(cedula);
}

export async function confirmRegister(cedula: string, confirmed: boolean) {
  return updateRegisterConfirmation(cedula, confirmed);
}
