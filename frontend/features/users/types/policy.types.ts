export type PolicyType = "privacy_policy" | "terms_of_service";

export const POLICY_TYPES: readonly PolicyType[] = [
  "privacy_policy",
  "terms_of_service",
] as const;

export type PolicyStatusItem = {
  type: PolicyType;
  currentVersion: string;
  accepted: boolean;
  acceptedAt: string | null;
};

export type PolicyStatus = {
  policies: PolicyStatusItem[];
};

export type AcceptPolicyResult = {
  type: PolicyType;
  version: string;
  status: "accepted" | "skipped";
  acceptedAt: string;
};

export type AcceptPoliciesResponse = {
  results: AcceptPolicyResult[];
};

export type PolicyContent = {
  type: PolicyType;
  version: string;
  content: string;
  publishedAt: string;
};
