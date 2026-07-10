export type CheckInResult =
  | { action: 'entered'; ticket: { id: string } }
  | { action: 'pending_confirmation'; ticket: { id: string } }
  | { action: 'confirmed_entry'; ticket: { id: string } }
  | { action: 'already_used'; ticket: { checkedInAt: Date } }
  | { action: 'wrong_status'; currentStatus: string }
  | { action: 'not_found' };
