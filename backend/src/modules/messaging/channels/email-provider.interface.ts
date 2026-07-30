export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
  contentId: string;
}

export interface EmailProvider {
  send(
    to: string,
    subject: string,
    html: string,
    attachments?: EmailAttachment[],
  ): Promise<void>;
}
