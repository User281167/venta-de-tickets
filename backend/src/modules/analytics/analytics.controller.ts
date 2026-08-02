import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { analyticsService } from './analytics.service.js';
import {
  dateRangeQuerySchema,
  donationsQuerySchema,
  topDiscountCodesQuerySchema,
  weeklyReportQuerySchema,
} from './analytics.validators.js';

function parseDateRange(
  req: Request,
  res: Response,
):
  | { ok: true; from: Date | undefined; to: Date | undefined }
  | { ok: false } {
  try {
    const parsed = dateRangeQuerySchema.parse(req.query);
    return { ok: true, from: parsed.from, to: parsed.to };
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: err.issues.map((i) => i.message).join(', '),
        },
      });

      return { ok: false };
    }
    throw err;
  }
}

function parseQuery<T>(
  req: Request,
  res: Response,
  schema: { parse: (input: unknown) => T },
): { ok: true; value: T } | { ok: false } {
  try {
    return { ok: true, value: schema.parse(req.query) };
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: err.issues.map((i) => i.message).join(', '),
        },
      });

      return { ok: false };
    }
    throw err;
  }
}

export async function getSalesWeekly(req: Request, res: Response): Promise<void> {
  const range = parseDateRange(req, res);
  if (!range.ok) return;

  const data = await analyticsService.salesDaily(range.from, range.to);
  res.json({ data });
}

export async function getRevenueCumulative(
  req: Request,
  res: Response,
): Promise<void> {
  const range = parseDateRange(req, res);
  if (!range.ok) return;

  const data = await analyticsService.revenueCumulative(range.from, range.to);
  res.json({ data });
}

export async function getSalesByTicketType(
  req: Request,
  res: Response,
): Promise<void> {
  const range = parseDateRange(req, res);
  if (!range.ok) return;

  const data = await analyticsService.salesByTicketTypeDaily(
    range.from,
    range.to,
  );
  res.json(data);
}

export async function getSalesSummary(
  req: Request,
  res: Response,
): Promise<void> {
  const range = parseDateRange(req, res);
  if (!range.ok) return;

  const data = await analyticsService.salesSummary(range.from, range.to);
  res.json({ data });
}

export async function getFunnel(_req: Request, res: Response): Promise<void> {
  const data = await analyticsService.funnel();
  res.json({ data });
}

export async function getTicketsStatusBreakdown(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await analyticsService.ticketsStatusBreakdown();
  res.json({ data });
}

export async function getNoShows(req: Request, res: Response): Promise<void> {
  const range = parseDateRange(req, res);
  if (!range.ok) return;

  const data = await analyticsService.noShows(range.from, range.to);
  res.json({ data });
}

export async function getUsersWeeklySignups(
  req: Request,
  res: Response,
): Promise<void> {
  const range = parseDateRange(req, res);
  if (!range.ok) return;

  const data = await analyticsService.usersDailySignups(range.from, range.to);
  res.json({ data });
}

export async function getUsersByRole(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await analyticsService.usersByRole();
  res.json({ data });
}

export async function getLoginActivity(
  req: Request,
  res: Response,
): Promise<void> {
  const range = parseDateRange(req, res);
  if (!range.ok) return;

  const data = await analyticsService.loginActivityDaily(
    range.from,
    range.to,
  );
  res.json({ data });
}

export async function getRefundsWeekly(
  req: Request,
  res: Response,
): Promise<void> {
  const range = parseDateRange(req, res);
  if (!range.ok) return;

  const data = await analyticsService.refundsDaily(range.from, range.to);
  res.json({ data });
}

export async function getRefundsRate(
  req: Request,
  res: Response,
): Promise<void> {
  const range = parseDateRange(req, res);
  if (!range.ok) return;

  const data = await analyticsService.refundsRate(range.from, range.to);
  res.json({ data });
}

export async function getTopDiscountCodes(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = parseQuery(req, res, topDiscountCodesQuerySchema);
  if (!parsed.ok) return;

  const data = await analyticsService.topDiscountCodes(
    parsed.value.limit,
    undefined,
    undefined,
  );
  res.json({ data });
}

export async function getDiscountsTotalAmount(
  req: Request,
  res: Response,
): Promise<void> {
  const range = parseDateRange(req, res);
  if (!range.ok) return;

  const data = await analyticsService.discountsTotalAmount(
    range.from,
    range.to,
  );
  res.json({ data });
}

export async function getDiscountsConversion(
  req: Request,
  res: Response,
): Promise<void> {
  const range = parseDateRange(req, res);
  if (!range.ok) return;

  const data = await analyticsService.discountsConversion(
    range.from,
    range.to,
  );
  res.json({ data });
}

export async function getDonationsWeekly(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = parseQuery(req, res, donationsQuerySchema);
  if (!parsed.ok) return;

  const data = await analyticsService.donationsDaily(
    parsed.value.from,
    parsed.value.to,
    parsed.value.state,
  );
  res.json({ data });
}

export async function getDonationsSummary(
  req: Request,
  res: Response,
): Promise<void> {
  const range = parseDateRange(req, res);
  if (!range.ok) return;

  const data = await analyticsService.donationsSummary(range.from, range.to);
  res.json({ data });
}

export async function getCheckinProgress(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await analyticsService.checkinProgress();
  res.json({ data });
}

export async function getWeeklyReport(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = parseQuery(req, res, weeklyReportQuerySchema);
  if (!parsed.ok) return;

  const data = await analyticsService.weeklyReport(parsed.value.week);
  if (!data) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Invalid week' },
    });

    return;
  }

  res.json({ data });
}
