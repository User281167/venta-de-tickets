export type MessagingChannel = 'email' | 'whatsapp';

export interface ConfirmationLinkPayload {
  ticketId: string;
  buyerName: string;
  channel: MessagingChannel;
  buyerContact: string;
  confirmationUrl: string;
}

export interface MessagingClient {
  sendConfirmationLink(payload: ConfirmationLinkPayload): Promise<void>;
}
