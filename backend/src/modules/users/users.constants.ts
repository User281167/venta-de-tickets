import type { PolicyType } from '@prisma/client';

export const POLICY_TYPES = [
  'privacy_policy',
  'terms_of_service',
] as const satisfies readonly PolicyType[];

export type PolicyTypeValue = (typeof POLICY_TYPES)[number];

export const PRIVACY_POLICY_VERSION = '1.0.0';
export const TERMS_OF_SERVICE_VERSION = '1.0.0';

export function isPolicyType(value: unknown): value is PolicyTypeValue {
  return (
    typeof value === 'string' &&
    (POLICY_TYPES as readonly string[]).includes(value)
  );
}
