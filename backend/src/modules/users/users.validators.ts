import { z } from 'zod';
import { POLICY_TYPES } from './users.constants.js';

export const acceptPoliciesSchema = z.object({
  types: z
    .array(z.enum(POLICY_TYPES))
    .min(1, 'At least one policy type is required'),
});

export const policyTypeParamSchema = z.object({
  type: z.enum(POLICY_TYPES),
});

export type AcceptPoliciesInput = z.infer<typeof acceptPoliciesSchema>;
export type PolicyTypeParam = z.infer<typeof policyTypeParamSchema>;
