export type DayPoint = {
  day: string;
  label: string;
  value: number;
};

export type CumulativePoint = {
  day: string;
  label: string;
  valueCents: number;
  cumulativeCents: number;
};

export type StackedDayPoint = {
  day: string;
  label: string;
  [ticketTypeId: string]: string | number;
};

export type SalesSummary = {
  totalRevenueCents: number;
  ticketsSold: number;
  averageTicketCents: number;
  capacitySoldPercent: number | null;
  totalCapacity: number;
};

export type FunnelStep = {
  status: string;
  label: string;
  count: number;
  percentOfFirst: number;
};

export type StatusBreakdown = {
  status: string;
  count: number;
  isPrePurchase: boolean;
};

export type NoShows = {
  count: number;
  confirmedTotal: number;
  noShowPercent: number;
};

export type LoginActivityPoint = {
  day: string;
  label: string;
  activeUsers: number;
};

export type RoleBreakdown = {
  role: string;
  count: number;
};

export type RefundDayPoint = {
  day: string;
  label: string;
  count: number;
  amountCents: number;
};

export type RefundRate = {
  refundedCount: number;
  completedCount: number;
  refundRatePercent: number;
};

export type DonationDayPoint = {
  day: string;
  label: string;
  account: string;
  count: number;
  amountPesos: number;
};

export type DonationSummaryRow = {
  account: string;
  state: string;
  count: number;
  amountPesos: number;
};

export type CheckinProgress = {
  used: number;
  confirmed: number;
  usedPercent: number;
};

export type WeeklyReport = {
  week: string;
  weekStart: string;
  weekEnd: string;
  sales: { ticketsSold: number; revenueCents: number };
  users: { newSignups: number; activeUsers: number };
  payments: { completed: number; refunded: number; amountCents: number };
  donations: { count: number; amountPesos: number };
};
