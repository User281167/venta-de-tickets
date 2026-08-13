import { PolicyStatus } from "./policy.types";

export type GetMeResponse = {
  user: {
    id: string;
    email: string;
    role: string | null;
    fullName: string | null;
    phone: string | null;
    cedula: string | null;
    address: string | null;
    dateOfBirth: string | null;
    egresado: boolean;
  };
  policyStatus: PolicyStatus;
};
