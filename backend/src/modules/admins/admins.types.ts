export type AdminRole = 'super_admin' | 'organizer' | 'staff' | 'checker';

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}
