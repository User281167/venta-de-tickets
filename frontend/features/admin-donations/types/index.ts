import { DonationAccount } from "@/shared/utils/donation-status";

export type DonationState =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled";

export interface DonationListRow {
  id: string;
  fullName: string | null;
  email: string | null;
  amountCents: number;
  state: DonationState;
  account: DonationAccount;
  externalReference: string;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DonationListResponse {
  data: DonationListRow[];
  total: number;
  page: number;
  limit: number;
}

export interface DonationFilters {
  page: number;
  limit: number;
  state?: DonationState;
  account?: DonationAccount;
  search?: string;
}
