import { analyticsRepository } from './analytics.repository.js';
import type {
  CumulativePoint,
  CheckinProgress,
  DonationSummaryRow,
  DonationDayPoint,
  FunnelStep,
  LoginActivityPoint,
  NoShows,
  RefundRate,
  RefundDayPoint,
  RoleBreakdown,
  SalesSummary,
  StackedDayPoint,
  StatusBreakdown,
  DayPoint,
  WeeklyReport,
} from './analytics.types.js';

const FUNNEL_LABELS: Record<string, string> = {
  reserved: 'Reservados (pre-pago)',
  paid: 'Pagados',
  pending_confirmation: 'Pendiente de confirmación',
  confirmed: 'Entradas Confirmada',
  used: 'Asistieron',
};

const STATUS_BREAKDOWN_LABELS: Record<string, { label: string; isPrePurchase: boolean }> = {
  reserved: { label: 'Reservados (pre-pago)', isPrePurchase: true },
  paid: { label: 'Pagados', isPrePurchase: false },
  pending_confirmation: { label: 'Por confirmar entrada', isPrePurchase: false },
  confirmed: { label: 'Confirmados', isPrePurchase: false },
  used: { label: 'Asistieron', isPrePurchase: false },
  cancelled: { label: 'Cancelados', isPrePurchase: false },
  expired: { label: 'Expirados', isPrePurchase: false },
};

function formatLabel(day: string): string {
  const d = new Date(day + 'T00:00:00Z');
  const dayNum = d.getUTCDate();
  const month = d.toLocaleString('es-CO', { month: 'short', timeZone: 'UTC' });

  return `${dayNum} ${month}`;
}

function ensureDailyBuckets(
  rows: Array<{ day: string; value: number }>,
): DayPoint[] {
  return rows.map((r) => ({
    day: r.day,
    label: formatLabel(r.day),
    value: r.value,
  }));
}

function uniqueSortedDays(rows: Array<{ day: string }>): string[] {
  const set = new Set(rows.map((r) => r.day));
  return [...set].sort();
}

function buildCumulative(
  payments: Array<{ id: string; total_cents: number; created_at: Date }>,
): CumulativePoint[] {
  const byDay = new Map<string, number>();

  for (const p of payments) {
    const d = new Date(p.created_at);
    d.setUTCHours(0, 0, 0, 0);

    const key = d.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + p.total_cents);
  }

  const days = [...byDay.keys()].sort();
  let running = 0;

  return days.map((key) => {
    running += byDay.get(key) ?? 0;
    return {
      day: key,
      label: formatLabel(key),
      valueCents: byDay.get(key) ?? 0,
      cumulativeCents: running,
    };
  });
}

export const analyticsService = {
  async salesDaily(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<DayPoint[]> {
    const rows = await analyticsRepository.salesDaily(from, to);
    return ensureDailyBuckets(
      rows.map((r) => ({ day: r.day, value: r.count })),
    );
  },

  async revenueCumulative(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<CumulativePoint[]> {
    const rows = await analyticsRepository.revenueCumulative(from, to);
    return buildCumulative(rows);
  },

  async salesByTicketTypeDaily(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<{ days: StackedDayPoint[]; ticketTypes: Array<{ id: string; name: string }> }> {
    const [rows, catalog] = await Promise.all([
      analyticsRepository.salesByTicketTypeDaily(from, to),
      analyticsRepository.ticketTypeCatalog(),
    ]);

    const nameById = new Map(catalog.map((c) => [c.id, c.name]));
    const days = uniqueSortedDays(rows);

    const data: StackedDayPoint[] = days.map((day) => {
      const point: StackedDayPoint = {
        day,
        label: formatLabel(day),
      };

      for (const c of catalog) {
        point[c.id] = 0;
      }

      for (const r of rows) {
        if (r.day === day) {
          point[r.ticketTypeId] = r.count;
        }
      }
      return point;
    });

    return {
      days: data,
      ticketTypes: catalog.map((c) => ({ id: c.id, name: nameById.get(c.id) ?? c.id })),
    };
  },

  async salesSummary(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<SalesSummary> {
    const { revenueCents, ticketsSold, totalCapacity } =
      await analyticsRepository.salesSummary(from, to);

    const averageTicketCents = ticketsSold > 0
      ? Math.trunc(revenueCents / ticketsSold)
      : 0;

    const capacitySoldPercent =
      totalCapacity > 0
        ? Number(((ticketsSold / totalCapacity) * 100).toFixed(2))
        : null;

    return {
      totalRevenueCents: revenueCents,
      ticketsSold,
      averageTicketCents,
      capacitySoldPercent,
      totalCapacity,
    };
  },

  async funnel(): Promise<FunnelStep[]> {
    const counts = await analyticsRepository.funnel();
    const lookup = new Map(counts.map((c) => [c.status, c.count]));
    const order: Array<keyof typeof FUNNEL_LABELS> = [
      'reserved',
      'paid',
      'pending_confirmation',
      'confirmed',
      'used',
    ];

    const first = lookup.get(order[0]) ?? 0;
    return order.map((s) => {
      const count = lookup.get(s) ?? 0;
      return {
        status: s,
        label: FUNNEL_LABELS[s],
        count,
        percentOfFirst: first > 0
          ? Number(((count / first) * 100).toFixed(2))
          : 0,
      };
    });
  },

  async ticketsStatusBreakdown(): Promise<StatusBreakdown[]> {
    const rows = await analyticsRepository.ticketsStatusBreakdown();
    return rows
      .map((r) => {
        const meta = STATUS_BREAKDOWN_LABELS[r.status];
        return {
          status: r.status,
          count: r.count,
          isPrePurchase: meta?.isPrePurchase ?? false,
        };
      })
      .sort((a, b) => b.count - a.count);
  },

  async noShows(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<NoShows> {
    const { confirmedTotal, noShows } = await analyticsRepository.noShows(
      from,
      to,
    );
    return {
      count: noShows,
      confirmedTotal,
      noShowPercent:
        confirmedTotal > 0
          ? Number(((noShows / confirmedTotal) * 100).toFixed(2))
          : 0,
    };
  },

  async usersDailySignups(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<DayPoint[]> {
    const rows = await analyticsRepository.usersDailySignups(from, to);
    return ensureDailyBuckets(
      rows.map((r) => ({ day: r.day, value: r.count })),
    );
  },

  async usersByRole(): Promise<RoleBreakdown[]> {
    const rows = await analyticsRepository.usersByRole();
    return rows.sort((a, b) => b.count - a.count);
  },

  async loginActivityDaily(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<LoginActivityPoint[]> {
    const rows = await analyticsRepository.loginActivityDaily(from, to);
    return rows.map((r) => ({
      day: r.day,
      label: formatLabel(r.day),
      activeUsers: r.activeUsers,
    }));
  },

  async refundsDaily(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<RefundDayPoint[]> {
    const rows = await analyticsRepository.refundsDaily(from, to);
    return rows.map((r) => ({
      day: r.day,
      label: formatLabel(r.day),
      count: r.count,
      amountCents: r.amountCents,
    }));
  },

  async refundsRate(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<RefundRate> {
    const { refunded, completed } = await analyticsRepository.refundsRate(
      from,
      to,
    );
    const total = refunded + completed;

    return {
      refundedCount: refunded,
      completedCount: completed,
      refundRatePercent:
        total > 0 ? Number(((refunded / total) * 100).toFixed(2)) : 0,
    };
  },

  async donationsDaily(
    from: Date | undefined,
    to: Date | undefined,
    state: string | undefined,
  ): Promise<DonationDayPoint[]> {
    const rows = await analyticsRepository.donationsDaily(from, to, state);
    return rows.map((r) => ({
      day: r.day,
      label: formatLabel(r.day),
      account: r.account,
      count: r.count,
      amountPesos: r.amountPesos,
    }));
  },

  async donationsSummary(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<DonationSummaryRow[]> {
    return analyticsRepository.donationsSummary(from, to);
  },

  async checkinProgress(): Promise<CheckinProgress> {
    const { used, confirmed } = await analyticsRepository.checkinProgress();
    const total = used + confirmed;
    return {
      used,
      confirmed,
      usedPercent:
        total > 0 ? Number(((used / total) * 100).toFixed(2)) : 0,
    };
  },

  async weeklyReport(week: string): Promise<WeeklyReport | null> {
    const match = week.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return null;

    const year = Number(match[1]);
    const weekNum = Number(match[2]);

    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const weekStart = new Date(jan4);
    weekStart.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (weekNum - 1) * 7);
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    const data = await analyticsRepository.weeklyReportWindow(
      weekStart,
      weekEnd,
    );

    return {
      week,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      ...data,
    };
  },
};
