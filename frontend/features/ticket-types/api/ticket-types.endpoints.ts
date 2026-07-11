import { authFetch } from "@/shared/api/admin-fetch";
import type {
  AdminTicketType,
  CreateTicketTypeInput,
  UpdateTicketTypeInput,
} from "../schemas/ticket-types.schema";

type BackendAdminTicketType = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  maxPerUser: number | null;
  saleEndsAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function toAdminTicketType(tt: BackendAdminTicketType): AdminTicketType {
  return {
    ...tt,
    isActive: tt.status === "enabled",
  };
}

export async function fetchAdminTicketTypes(): Promise<AdminTicketType[]> {
  const body = await authFetch<{ data: BackendAdminTicketType[] }>(
    "/api/admin/tickets",
  );

  return body.data.map(toAdminTicketType);
}

export async function createAdminTicketType(
  data: CreateTicketTypeInput,
): Promise<AdminTicketType> {
  const result = await authFetch<BackendAdminTicketType>(
    "/api/admin/tickets",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

  return toAdminTicketType(result);
}

export async function updateAdminTicketType(
  id: string,
  data: UpdateTicketTypeInput,
): Promise<AdminTicketType> {
  const body: Record<string, unknown> = { ...data };

  if (body.isActive !== undefined) {
    body.status = body.isActive ? "enabled" : "disabled";
    delete body.isActive;
  }

  const result = await authFetch<BackendAdminTicketType>(
    `/api/admin/tickets/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );

  return toAdminTicketType(result);
}

export async function deactivateAdminTicketType(id: string): Promise<void> {
  await authFetch<void>(`/api/admin/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "disabled" }),
  });
}
