import { prisma } from '../../shared/database/prisma.client.js';
import type { Prisma, TicketStatus } from '@prisma/client';

type DayRow = {
  day: Date;
  count: bigint;
  sum_cents: bigint | null;
};

type DayTypeRow = {
  day: Date;
  ticket_type_id: string;
  count: bigint;
};

type StatusCountRow = {
  status: string;
  count: bigint;
};

type RefundDayRow = {
  day: Date;
  count: bigint;
  amount_cents: bigint;
};

type DonationDayRow = {
  day: Date;
  account: string;
  state: string;
  count: bigint;
  amount_pesos: number;
};

type PaymentRevenueRow = {
  id: string;
  total_cents: number;
  created_at: Date;
};

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const soldStatuses: TicketStatus[] = [
  'paid',
  'confirmed',
  'used',
  'pending_confirmation',
];

const donationStates: Record<string, string> = {
  rejected: 'Rechazado',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  pending: 'Pendiente',
}

export const analyticsRepository = {
  async salesDaily(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<Array<{ day: string; count: number; sumCents: number }>> {
    const rows = await prisma.$queryRaw<DayRow[]>`
      SELECT
        date_trunc('day', purchased_at AT TIME ZONE 'UTC') AS day,
        count(*)::bigint AS count,
        sum(unit_price_cents)::bigint AS sum_cents
      FROM tickets
      WHERE purchased_at IS NOT NULL
        AND status IN ('paid','confirmed','used','pending_confirmation')
        AND (${from}::timestamptz IS NULL OR purchased_at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR purchased_at <= ${to}::timestamptz)
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return rows.map((r) => ({
      day: toIsoDate(r.day),
      count: Number(r.count),
      sumCents: Number(r.sum_cents ?? 0n),
    }));
  },

  async revenueCumulative(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<PaymentRevenueRow[]> {
    return prisma.$queryRaw<PaymentRevenueRow[]>`
      SELECT id, total_cents, created_at
      FROM payments
      WHERE status = 'completed'
        AND (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR created_at <= ${to}::timestamptz)
      ORDER BY created_at ASC
    `;
  },

  async salesByTicketTypeDaily(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<Array<{ day: string; ticketTypeId: string; count: number }>> {
    const rows = await prisma.$queryRaw<DayTypeRow[]>`
      SELECT
        date_trunc('day', purchased_at AT TIME ZONE 'UTC') AS day,
        ticket_type_id::text AS ticket_type_id,
        count(*)::bigint AS count
      FROM tickets
      WHERE purchased_at IS NOT NULL
        AND status IN ('paid','confirmed','used','pending_confirmation')
        AND (${from}::timestamptz IS NULL OR purchased_at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR purchased_at <= ${to}::timestamptz)
      GROUP BY 1, 2
      ORDER BY 1 ASC
    `;

    return rows.map((r) => ({
      day: toIsoDate(r.day),
      ticketTypeId: r.ticket_type_id,
      count: Number(r.count),
    }));
  },

  ticketTypeCatalog(): Promise<
    Array<{ id: string; name: string; total: number; sold: number }>
  > {
    return prisma.ticketType
      .findMany({
        where: { status: { not: 'blocked' } },
        select: {
          id: true,
          name: true,
          quantityTotal: true,
          quantitySold: true,
        },
        orderBy: { createdAt: 'asc' },
      })
      .then((rows) =>
        rows.map((r) => ({
          id: r.id,
          name: r.name,
          total: r.quantityTotal,
          sold: r.quantitySold,
        })),
      );
  },

  async salesSummary(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<{
    revenueCents: number;
    ticketsSold: number;
    totalCapacity: number;
  }> {
    const wherePayment: Prisma.PaymentWhereInput = {
      status: 'completed',
    };

    if (from || to) {
      wherePayment.createdAt = {};
      if (from) wherePayment.createdAt.gte = from;
      if (to) wherePayment.createdAt.lte = to;
    }

    const whereTicket: Prisma.TicketWhereInput = {
      purchasedAt: { not: null },
      status: { in: soldStatuses },
    };

    if (from || to) {
      whereTicket.purchasedAt = {};

      if (from) (whereTicket.purchasedAt as Prisma.DateTimeFilter).gte = from;
      if (to) (whereTicket.purchasedAt as Prisma.DateTimeFilter).lte = to;
    }

    const [agg, count, capacityAgg] = await Promise.all([
      prisma.payment.aggregate({
        where: wherePayment,
        _sum: { totalCents: true },
      }),
      prisma.ticket.count({ where: whereTicket }),
      prisma.ticketType.aggregate({ _sum: { quantityTotal: true } }),
    ]);

    return {
      revenueCents: agg._sum.totalCents ?? 0,
      ticketsSold: count,
      totalCapacity: capacityAgg._sum.quantityTotal ?? 0,
    };
  },

  async funnel(): Promise<Array<{ status: string; count: number }>> {
    const grouped = await prisma.ticket.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    return grouped.map((g) => ({
      status: g.status,
      count: g._count._all,
    }));
  },

  async ticketsStatusBreakdown(): Promise<
    Array<{ status: string; count: number }>
  > {
    return this.funnel();
  },

  async noShows(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<{ confirmedTotal: number; noShows: number }> {
    const where: Prisma.TicketWhereInput = {
      status: { in: ['confirmed', 'used'] },
    };

    if (from || to) {
      where.purchasedAt = {};
      if (from) where.purchasedAt.gte = from;
      if (to) where.purchasedAt.lte = to;
    }

    const all = await prisma.ticket.findMany({
      where,
      select: { status: true, checkedInAt: true },
    });

    const confirmedTotal = all.length;
    const noShows = all.filter(
      (t) => t.status === 'confirmed' && t.checkedInAt === null,
    ).length;

    return { confirmedTotal, noShows };
  },

  async usersDailySignups(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<Array<{ day: string; count: number }>> {
    const rows = await prisma.$queryRaw<
      Array<{ day: Date; count: bigint }>
    >`
      SELECT
        date_trunc('day', created_at AT TIME ZONE 'UTC') AS day,
        count(*)::bigint AS count
      FROM users
      WHERE (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR created_at <= ${to}::timestamptz)
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return rows.map((r) => ({
      day: toIsoDate(r.day),
      count: Number(r.count),
    }));
  },

  async usersByRole(): Promise<Array<{ role: string; count: number }>> {
    const grouped = await prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });

    return grouped.map((g) => ({
      role: g.role,
      count: g._count._all,
    })).filter((a) => a.role !== 'super_admin');
  },

  async loginActivityDaily(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<Array<{ day: string; activeUsers: number }>> {
    const rows = await prisma.$queryRaw<
      Array<{ day: Date; active_users: bigint }>
    >`
      SELECT
        date_trunc('day', t.created_at AT TIME ZONE 'UTC') AS day,
        count(DISTINCT t.user_id)::bigint AS active_users
      FROM tickets t
      INNER JOIN users u ON u.id = t.user_id
      WHERE t.user_id IS NOT NULL
        AND u.role = 'client'
        AND (${from}::timestamptz IS NULL OR t.created_at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR t.created_at <= ${to}::timestamptz)
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return rows.map((r) => ({
      day: toIsoDate(r.day),
      activeUsers: Number(r.active_users),
    }));
  },

  async refundsDaily(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<Array<{ day: string; count: number; amountCents: number }>> {
    const rows = await prisma.$queryRaw<RefundDayRow[]>`
      SELECT
        date_trunc('day', updated_at AT TIME ZONE 'UTC') AS day,
        count(*)::bigint AS count,
        sum(total_cents)::bigint AS amount_cents
      FROM payments
      WHERE status = 'refunded'
        AND (${from}::timestamptz IS NULL OR updated_at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR updated_at <= ${to}::timestamptz)
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return rows.map((r) => ({
      day: toIsoDate(r.day),
      count: Number(r.count),
      amountCents: Number(r.amount_cents),
    }));
  },

  async refundsRate(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<{ refunded: number; completed: number }> {
    const where: Prisma.PaymentWhereInput = {};

    if (from || to) {
      where.createdAt = {};

      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const [refunded, completed] = await Promise.all([
      prisma.payment.count({ where: { ...where, status: 'refunded' } }),
      prisma.payment.count({ where: { ...where, status: 'completed' } }),
    ]);

    return { refunded, completed };
  },

  async topDiscountCodes(
    limit: number,
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<
    Array<{
      id: string;
      code: string;
      usedCount: number;
      maxUses: number | null;
      discountCents: number;
    }>
  > {
    const where: Prisma.PaymentWhereInput = {
      status: 'completed',
      discountCodeId: { not: null },
    };

    if (from || to) {
      where.createdAt = {};

      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const grouped = await prisma.payment.groupBy({
      by: ['discountCodeId'],
      where,
      _sum: { discountCents: true },
      _count: { _all: true },
      orderBy: { _count: { discountCodeId: 'desc' } },
      take: limit,
    });

    const ids = grouped
      .map((g) => g.discountCodeId)
      .filter((id): id is string => id !== null);

    if (ids.length === 0) return [];

    const codes = await prisma.discountCode.findMany({
      where: { id: { in: ids } },
      select: { id: true, code: true, usedCount: true, maxUses: true },
    });

    const codeMap = new Map(codes.map((c) => [c.id, c]));

    return grouped
      .map((g) => {
        const meta = g.discountCodeId ? codeMap.get(g.discountCodeId) : null;
        if (!meta || !g.discountCodeId) return null;
        return {
          id: meta.id,
          code: meta.code,
          usedCount: meta.usedCount,
          maxUses: meta.maxUses,
          discountCents: g._sum.discountCents ?? 0,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  },

  async discountsTotalAmount(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<{ amountCents: number; uses: number }> {
    const where: Prisma.PaymentWhereInput = {
      status: 'completed',
      discountCodeId: { not: null },
    };

    if (from || to) {
      where.createdAt = {};

      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const agg = await prisma.payment.aggregate({
      where,
      _sum: { discountCents: true },
      _count: { _all: true },
    });

    return {
      amountCents: agg._sum.discountCents ?? 0,
      uses: agg._count._all,
    };
  },

  async donationsDaily(
    from: Date | undefined,
    to: Date | undefined,
    state: string | undefined,
  ): Promise<
    Array<{
      day: string;
      account: string;
      state: string;
      count: number;
      amountPesos: number;
    }>
  > {
    const rows = await prisma.$queryRaw<DonationDayRow[]>`
      SELECT
        date_trunc('day', created_at AT TIME ZONE 'UTC') AS day,
        account::text AS account,
        state::text AS state,
        count(*)::bigint AS count,
        sum(amount_cents)::numeric AS amount_pesos
      FROM donations
      WHERE (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR created_at <= ${to}::timestamptz)
        AND (${state}::text IS NULL OR state::text = ${state}::text)
      GROUP BY 1, 2, 3
      ORDER BY 1 ASC
    `;

    return rows.map((r) => ({
      day: toIsoDate(r.day),
      account: r.account,
      state: r.state,
      count: Number(r.count),
      amountPesos: Number(r.amount_pesos),
    }));
  },

  async donationsSummary(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<
    Array<{ account: string; state: string; count: number; amountPesos: number }>
  > {
    const where: Prisma.DonationWhereInput = {};

    if (from || to) {
      where.createdAt = {};

      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const grouped = await prisma.donation.groupBy({
      by: ['account', 'state'],
      where,
      _count: { _all: true },
      _sum: { amountCents: true },
    });

    return grouped.map((g) => ({
      account: g.account,
      state: donationStates[g.state] ?? g.state,
      count: g._count._all,
      amountPesos: Number(g._sum.amountCents ?? 0),
    }));
  },

  async checkinProgress(): Promise<{ used: number; confirmed: number }> {
    const [used, confirmed] = await Promise.all([
      prisma.ticket.count({ where: { status: 'used' } }),
      prisma.ticket.count({ where: { status: 'confirmed' } }),
    ]);
    return { used, confirmed };
  },

  async weeklyReportWindow(
    weekStart: Date,
    weekEnd: Date,
  ): Promise<{
    sales: { ticketsSold: number; revenueCents: number };
    users: { newSignups: number; activeUsers: number };
    payments: { completed: number; refunded: number; amountCents: number };
    donations: { count: number; amountPesos: number };
  }> {
    const [ticketsCount, ticketSum, signups, completed, refunded, donationCount, donationSum, activeUsers] =
      await Promise.all([
        prisma.ticket.count({
          where: {
            purchasedAt: { gte: weekStart, lte: weekEnd },
            status: { in: soldStatuses },
          },
        }),
        prisma.ticket.aggregate({
          where: {
            purchasedAt: { gte: weekStart, lte: weekEnd },
            status: { in: soldStatuses },
          },
          _sum: { unitPriceCents: true },
        }),
        prisma.user.count({
          where: { createdAt: { gte: weekStart, lte: weekEnd } },
        }),
        prisma.payment.count({
          where: {
            status: 'completed',
            createdAt: { gte: weekStart, lte: weekEnd },
          },
        }),
        prisma.payment.count({
          where: {
            status: 'refunded',
            updatedAt: { gte: weekStart, lte: weekEnd },
          },
        }),
        prisma.donation.count({
          where: {
            createdAt: { gte: weekStart, lte: weekEnd },
            state: 'confirmed',
          },
        }),
        prisma.donation.aggregate({
          where: {
            createdAt: { gte: weekStart, lte: weekEnd },
            state: 'confirmed',
          },
          _sum: { amountCents: true },
        }),
        prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT count(DISTINCT t.user_id)::bigint AS count
          FROM tickets t
          INNER JOIN users u ON u.id = t.user_id
          WHERE t.user_id IS NOT NULL
            AND u.role = 'client'
            AND t.created_at >= ${weekStart}::timestamptz
            AND t.created_at <= ${weekEnd}::timestamptz
        `,
      ]);

    const paymentSum = await prisma.payment.aggregate({
      where: {
        status: 'completed',
        createdAt: { gte: weekStart, lte: weekEnd },
      },
      _sum: { totalCents: true },
    });

    return {
      sales: {
        ticketsSold: ticketsCount,
        revenueCents: ticketSum._sum.unitPriceCents ?? 0,
      },
      users: {
        newSignups: signups,
        activeUsers: Number(activeUsers[0]?.count ?? 0n),
      },
      payments: {
        completed,
        refunded,
        amountCents: paymentSum._sum.totalCents ?? 0,
      },
      donations: {
        count: donationCount,
        amountPesos: Number(donationSum._sum.amountCents ?? 0),
      },
    };
  },
};
