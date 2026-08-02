import { z } from "zod";

export const analyticsDateRangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export type AnalyticsDateRange = z.infer<typeof analyticsDateRangeSchema>;

const dayPointSchema = z.object({
  day: z.string(),
  label: z.string(),
  value: z.number(),
});
export type DayPoint = z.infer<typeof dayPointSchema>;

const cumulativePointSchema = z.object({
  day: z.string(),
  label: z.string(),
  valueCents: z.number(),
  cumulativeCents: z.number(),
});
export type CumulativePoint = z.infer<typeof cumulativePointSchema>;

const salesByTicketTypeSchema = z.object({
  days: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
  ticketTypes: z.array(z.object({ id: z.string(), name: z.string() })),
});
export type SalesByTicketType = z.infer<typeof salesByTicketTypeSchema>;

const salesSummarySchema = z.object({
  data: z.object({
    totalRevenueCents: z.number(),
    ticketsSold: z.number(),
    averageTicketCents: z.number(),
    capacitySoldPercent: z.number().nullable(),
    totalCapacity: z.number(),
  }),
});

const funnelStepSchema = z.object({
  status: z.string(),
  label: z.string(),
  count: z.number(),
  percentOfFirst: z.number(),
});

const statusBreakdownSchema = z.object({
  data: z.array(
    z.object({
      status: z.string(),
      count: z.number(),
      isPrePurchase: z.boolean(),
    }),
  ),
});

const noShowsSchema = z.object({
  data: z.object({
    count: z.number(),
    confirmedTotal: z.number(),
    noShowPercent: z.number(),
  }),
});

const loginActivityPointSchema = z.object({
  day: z.string(),
  label: z.string(),
  activeUsers: z.number(),
});

const roleBreakdownSchema = z.object({
  data: z.array(z.object({ role: z.string(), count: z.number() })),
});

const refundDayPointSchema = z.object({
  day: z.string(),
  label: z.string(),
  count: z.number(),
  amountCents: z.number(),
});

const refundRateSchema = z.object({
  data: z.object({
    refundedCount: z.number(),
    completedCount: z.number(),
    refundRatePercent: z.number(),
  }),
});

const topDiscountCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  usedCount: z.number(),
  maxUses: z.number().nullable(),
  conversionPercent: z.number().nullable(),
  discountCents: z.number(),
});

const donationDayPointSchema = z.object({
  day: z.string(),
  label: z.string(),
  account: z.string(),
  count: z.number(),
  amountPesos: z.number(),
});

const donationSummarySchema = z.object({
  data: z.array(
    z.object({
      account: z.string(),
      state: z.string(),
      count: z.number(),
      amountPesos: z.number(),
    }),
  ),
});

const checkinProgressSchema = z.object({
  data: z.object({
    used: z.number(),
    confirmed: z.number(),
    usedPercent: z.number(),
  }),
});

export const responseSchemas = {
  dayPoint: dayPointSchema,
  dayPointList: z.object({ data: z.array(dayPointSchema) }),
  cumulativePointList: z.object({ data: z.array(cumulativePointSchema) }),
  salesByTicketType: salesByTicketTypeSchema,
  salesSummary: salesSummarySchema,
  funnelList: z.object({ data: z.array(funnelStepSchema) }),
  statusBreakdown: statusBreakdownSchema,
  noShows: noShowsSchema,
  loginActivityList: z.object({ data: z.array(loginActivityPointSchema) }),
  roleBreakdown: roleBreakdownSchema,
  refundDayList: z.object({ data: z.array(refundDayPointSchema) }),
  refundRate: refundRateSchema,
  topDiscountCodes: z.object({ data: z.array(topDiscountCodeSchema) }),
  donationDayList: z.object({ data: z.array(donationDayPointSchema) }),
  donationSummary: donationSummarySchema,
  checkinProgress: checkinProgressSchema,
};

export type SalesSummary = z.infer<typeof salesSummarySchema>["data"];
export type FunnelStep = z.infer<typeof funnelStepSchema>;
export type NoShows = z.infer<typeof noShowsSchema>["data"];
export type RoleBreakdown = z.infer<
  typeof roleBreakdownSchema
>["data"][number];
export type RefundDayPoint = z.infer<typeof refundDayPointSchema>;
export type RefundRate = z.infer<typeof refundRateSchema>["data"];
export type TopDiscountCode = z.infer<typeof topDiscountCodeSchema>;
export type DonationDayPoint = z.infer<typeof donationDayPointSchema>;
export type DonationSummary = z.infer<typeof donationSummarySchema>["data"];
export type CheckinProgress = z.infer<typeof checkinProgressSchema>["data"];
export type LoginActivityPoint = z.infer<typeof loginActivityPointSchema>;
export type StatusBreakdownRow = z.infer<
  typeof statusBreakdownSchema
>["data"][number];
