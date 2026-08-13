import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PolicyType } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type PolicyConfig = {
  type: PolicyType;
  version: string;
  file: string;
};

export const POLICY_CONFIGS: readonly PolicyConfig[] = [
  {
    type: 'privacy_policy',
    version: '1.0.0',
    file: 'privacy-policy.es.txt',
  },
  {
    type: 'terms_of_service',
    version: '1.0.0',
    file: 'terms-of-service.es.txt',
  },
] as const;

export function getPolicyFilePath(file: string): string {
  return path.join(__dirname, file);
}