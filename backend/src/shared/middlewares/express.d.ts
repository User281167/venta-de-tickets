import type { Logger } from 'pino';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string | null;
      };
      confirmation?: {
        ticketId: string;
      };
      log: Logger;
    }
  }
}

export {};
