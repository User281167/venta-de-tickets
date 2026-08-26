// E.164 Colombia solamente: cubre a todos los remitentes actuales. Cambiar por intl-tel-input cuando se implemente la compatibilidad con varios países.
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.trim().replace(/[\s\-().]/g, '');

  const normalized = cleaned.startsWith('+')
    ? cleaned
    : cleaned.startsWith('57')
      ? `+${cleaned}`
      : cleaned.startsWith('3')
        ? `+57${cleaned}`
        : cleaned;

  if (!/^\+57\d{10}$/.test(normalized)) {
    throw new Error(`Invalid Colombian phone: ${phone}`);
  }

  return normalized;
}
