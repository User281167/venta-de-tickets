import type { AdminProfile } from '../../modules/admins/admins.types.js';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
    };
    admin?: AdminProfile;
  }
}

export {};
