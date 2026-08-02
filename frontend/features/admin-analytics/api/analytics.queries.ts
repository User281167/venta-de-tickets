import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";
import { authFetch } from "@/shared/api/admin-fetch";
import type { AnalyticsDateRange } from "../schemas/analytics.schema";
import {
  responseSchemas,
  type CheckinProgress,
  type CumulativePoint,
  type DonationSummary,
  type DonationDayPoint,
  type FunnelStep,
  type LoginActivityPoint,
  type NoShows,
  type RefundRate,
  type RefundDayPoint,
  type RoleBreakdown,
  type SalesByTicketType,
  type SalesSummary,
  type StatusBreakdownRow,
  type TopDiscountCode,
  type DayPoint,
} from "../schemas/analytics.schema";

function buildRangeParams(range: AnalyticsDateRange): string {
  const params = new URLSearchParams();
  if (range.from) params.set("from", range.from);
  if (range.to) params.set("to", range.to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function parse<T>(schema: { parse: (input: unknown) => T }, raw: unknown): T {
  return schema.parse(raw);
}

function rangeKey(range: AnalyticsDateRange) {
  return [range.from ?? "", range.to ?? ""];
}

export function useSalesDaily(range: AnalyticsDateRange) {
  return useQuery<DayPoint[]>({
    queryKey: ["analytics", "sales-daily", ...rangeKey(range)],
    queryFn: async () => {
      const raw = await authFetch<{ data: DayPoint[] }>(
        `/api/admin/analytics/sales/weekly${buildRangeParams(range)}`,
      );
      return parse(responseSchemas.dayPointList, raw).data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useRevenueCumulative(range: AnalyticsDateRange) {
  return useQuery<CumulativePoint[]>({
    queryKey: ["analytics", "revenue-cumulative", ...rangeKey(range)],
    queryFn: async () => {
      const raw = await authFetch<{ data: CumulativePoint[] }>(
        `/api/admin/analytics/revenue/cumulative${buildRangeParams(range)}`,
      );
      return parse(responseSchemas.cumulativePointList, raw).data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useSalesByTicketType(range: AnalyticsDateRange) {
  return useQuery<SalesByTicketType>({
    queryKey: ["analytics", "sales-by-type", ...rangeKey(range)],
    queryFn: async () => {
      const raw = await authFetch<SalesByTicketType>(
        `/api/admin/analytics/sales/by-ticket-type${buildRangeParams(range)}`,
      );
      return parse(responseSchemas.salesByTicketType, raw);
    },
    placeholderData: keepPreviousData,
  });
}

export function useSalesSummary(range: AnalyticsDateRange) {
  return useQuery<SalesSummary>({
    queryKey: ["analytics", "sales-summary", ...rangeKey(range)],
    queryFn: async () => {
      const raw = await authFetch<unknown>(
        `/api/admin/analytics/sales/summary${buildRangeParams(range)}`,
      );
      return parse(responseSchemas.salesSummary, raw).data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useFunnel() {
  return useQuery<FunnelStep[]>({
    queryKey: ["analytics", "funnel"],
    queryFn: async () => {
      const raw = await authFetch<{ data: FunnelStep[] }>(
        `/api/admin/analytics/funnel`,
      );
      return parse(responseSchemas.funnelList, raw).data;
    },
  });
}

export function useTicketsStatusBreakdown() {
  return useQuery<StatusBreakdownRow[]>({
    queryKey: ["analytics", "status-breakdown"],
    queryFn: async () => {
      const raw = await authFetch<{ data: StatusBreakdownRow[] }>(
        `/api/admin/analytics/tickets/status-breakdown`,
      );
      return parse(responseSchemas.statusBreakdown, raw).data;
    },
  });
}

export function useNoShows(range: AnalyticsDateRange) {
  return useQuery<NoShows>({
    queryKey: ["analytics", "no-shows", ...rangeKey(range)],
    queryFn: async () => {
      const raw = await authFetch<unknown>(
        `/api/admin/analytics/tickets/no-shows${buildRangeParams(range)}`,
      );
      return parse(responseSchemas.noShows, raw).data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useUsersDailySignups(range: AnalyticsDateRange) {
  return useQuery<DayPoint[]>({
    queryKey: ["analytics", "users-signups", ...rangeKey(range)],
    queryFn: async () => {
      const raw = await authFetch<{ data: DayPoint[] }>(
        `/api/admin/analytics/users/weekly-signups${buildRangeParams(range)}`,
      );
      return parse(responseSchemas.dayPointList, raw).data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useUsersByRole() {
  return useQuery<RoleBreakdown[]>({
    queryKey: ["analytics", "users-by-role"],
    queryFn: async () => {
      const raw = (await authFetch<unknown>(
        `/api/admin/analytics/users/by-role`,
      )) as { data: RoleBreakdown[] };
      return raw.data;
    },
  });
}

export function useLoginActivity(range: AnalyticsDateRange) {
  return useQuery<LoginActivityPoint[]>({
    queryKey: ["analytics", "login-activity", ...rangeKey(range)],
    queryFn: async () => {
      const raw = await authFetch<{ data: LoginActivityPoint[] }>(
        `/api/admin/analytics/users/login-activity${buildRangeParams(range)}`,
      );
      return parse(responseSchemas.loginActivityList, raw).data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useRefundsDaily(range: AnalyticsDateRange) {
  return useQuery<RefundDayPoint[]>({
    queryKey: ["analytics", "refunds-daily", ...rangeKey(range)],
    queryFn: async () => {
      const raw = await authFetch<{ data: RefundDayPoint[] }>(
        `/api/admin/analytics/refunds/weekly${buildRangeParams(range)}`,
      );
      return parse(responseSchemas.refundDayList, raw).data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useRefundsRate(range: AnalyticsDateRange) {
  return useQuery<RefundRate>({
    queryKey: ["analytics", "refunds-rate", ...rangeKey(range)],
    queryFn: async () => {
      const raw = await authFetch<unknown>(
        `/api/admin/analytics/refunds/rate${buildRangeParams(range)}`,
      );
      return parse(responseSchemas.refundRate, raw).data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useTopDiscountCodes() {
  return useQuery<TopDiscountCode[]>({
    queryKey: ["analytics", "top-discounts"],
    queryFn: async () => {
      const raw = await authFetch<{ data: TopDiscountCode[] }>(
        `/api/admin/analytics/discounts/top-codes?limit=10`,
      );
      return parse(responseSchemas.topDiscountCodes, raw).data;
    },
  });
}

export function useDiscountsTotalAmount(range: AnalyticsDateRange) {
  return useQuery<{ amountCents: number; uses: number }>({
    queryKey: ["analytics", "discounts-total", ...rangeKey(range)],
    queryFn: async () => {
      const raw = await authFetch<{
        data: { amountCents: number; uses: number };
      }>(
        `/api/admin/analytics/discounts/total-amount${buildRangeParams(range)}`,
      );
      return raw.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useDiscountsConversion() {
  return useQuery<TopDiscountCode[]>({
    queryKey: ["analytics", "discounts-conversion"],
    queryFn: async () => {
      const raw = await authFetch<{ data: TopDiscountCode[] }>(
        `/api/admin/analytics/discounts/conversion`,
      );
      return parse(responseSchemas.topDiscountCodes, raw).data;
    },
  });
}

export function useDonationsDaily(state?: string) {
  return useQuery<DonationDayPoint[]>({
    queryKey: ["analytics", "donations-daily", state ?? "all"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (state) params.set("state", state);
      const qs = params.toString();
      const raw = await authFetch<{ data: DonationDayPoint[] }>(
        `/api/admin/analytics/donations/weekly${qs ? `?${qs}` : ""}`,
      );
      return parse(responseSchemas.donationDayList, raw).data;
    },
  });
}

export function useDonationsSummary() {
  return useQuery<DonationSummary>({
    queryKey: ["analytics", "donations-summary"],
    queryFn: async () => {
      const raw = await authFetch<{ data: DonationSummary }>(
        `/api/admin/analytics/donations/summary`,
      );
      return parse(responseSchemas.donationSummary, raw).data;
    },
  });
}

export function useCheckinProgress() {
  return useQuery<CheckinProgress>({
    queryKey: ["analytics", "checkin-progress"],
    queryFn: async () => {
      const raw = await authFetch<{ data: CheckinProgress }>(
        `/api/admin/analytics/checkin/progress`,
      );
      return parse(responseSchemas.checkinProgress, raw).data;
    },
  });
}

export function useWeeklyReport(week: string) {
  return useQuery({
    queryKey: ["analytics", "weekly-report", week],
    queryFn: () =>
      authFetch<{ data: unknown }>(
        `/api/admin/analytics/weekly-report?week=${encodeURIComponent(week)}`,
      ),
    enabled: !!week,
  });
}

export type {
  DayPoint,
  CumulativePoint,
  SalesByTicketType,
  SalesSummary,
  FunnelStep,
  StatusBreakdownRow,
  NoShows,
  LoginActivityPoint,
  RoleBreakdown,
  RefundDayPoint,
  RefundRate,
  TopDiscountCode,
  DonationDayPoint,
  DonationSummary,
  CheckinProgress,
};
