import { POLICY_TYPES, type PolicyTypeValue } from './users.constants.js';

export type PolicyStatusItem = {
  type: PolicyTypeValue;
  currentVersion: string;
  accepted: boolean;
  acceptedAt: string | null;
};

export type AcceptPoliciesResult = {
  results: Array<{
    type: PolicyTypeValue;
    version: string;
    status: 'accepted' | 'skipped';
    acceptedAt: string;
  }>;
};
