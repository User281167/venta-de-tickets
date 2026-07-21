import type { JwtPayload } from 'jsonwebtoken';

export type ConfirmationResult = 'confirmed' | 'rejected';

export interface ConfirmationTokenPayload extends JwtPayload {
  tid: string;
  purpose: 'confirm';
}
