export type CheckerAction =
  'confirm_entry_direct' | 'request_confirmation' | 'allow_entry';

export type TicketStatus =
  | 'paid'
  | 'pending_confirmation'
  | 'confirmed'
  | 'used'
  | 'reserved'
  | 'cancelled'
  | 'expired';

export interface TicketSummary {
  ticketId: string;
  status: TicketStatus;
  attendeeName: string;
  attendeeCedula: string | null;
  ticketTypeName: string;
  checkedInAt: string | null;
  allowedActions: CheckerAction[];
}

export function getAllowedActions(status: TicketStatus): CheckerAction[] {
  switch (status) {
    case 'paid':
      return ['confirm_entry_direct', 'request_confirmation'];
    case 'confirmed':
      return ['allow_entry'];
    case 'pending_confirmation':
    case 'used':
    case 'reserved':
    case 'cancelled':
    case 'expired':
      return [];
  }
}
