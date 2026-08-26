export interface ConfirmationLinkPayload {
  ticketId: string;
  buyerName: string;
  email: string | null;
  phone: string | null;
  confirmationUrl: string;
  qrImageUrl: string;
}

export interface MessagingClient {
  sendConfirmationLink(payload: ConfirmationLinkPayload): Promise<void>;
}
