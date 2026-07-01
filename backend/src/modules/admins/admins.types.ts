export type AdminRole = 'super_admin' | 'organizer' | 'staff' | 'checker';

export interface AdminProfile {
  id: string;
  email: string;
  role: AdminRole;
}
