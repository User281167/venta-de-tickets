export type AdminRole = 'admin' | 'checker' | 'client';

export interface AdminProfile {
  id: string;
  email: string;
  role: AdminRole;
}
