import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/require-role.middleware.js';
import { rateLimit } from '../../shared/middlewares/rate-limit.middleware.js';
import { POLICIES } from '../../shared/middlewares/rate-limit.policies.js';
import * as ctrl from './analytics.controller.js';

export const analyticsRouter = Router();

analyticsRouter.use(
  authMiddleware,
  requireRole('super_admin', 'admin'),
  rateLimit(POLICIES.admin),
);

analyticsRouter.get('/sales/weekly', ctrl.getSalesWeekly);
analyticsRouter.get('/revenue/cumulative', ctrl.getRevenueCumulative);
analyticsRouter.get('/sales/by-ticket-type', ctrl.getSalesByTicketType);
analyticsRouter.get('/sales/summary', ctrl.getSalesSummary);

analyticsRouter.get('/funnel', ctrl.getFunnel);
analyticsRouter.get('/tickets/status-breakdown', ctrl.getTicketsStatusBreakdown);
analyticsRouter.get('/tickets/no-shows', ctrl.getNoShows);

analyticsRouter.get('/users/weekly-signups', ctrl.getUsersWeeklySignups);
analyticsRouter.get('/users/by-role', ctrl.getUsersByRole);
analyticsRouter.get('/users/login-activity', ctrl.getLoginActivity);

analyticsRouter.get('/refunds/weekly', ctrl.getRefundsWeekly);
analyticsRouter.get('/refunds/rate', ctrl.getRefundsRate);

analyticsRouter.get('/discounts/top-codes', ctrl.getTopDiscountCodes);
analyticsRouter.get('/discounts/total-amount', ctrl.getDiscountsTotalAmount);
analyticsRouter.get('/discounts/conversion', ctrl.getDiscountsConversion);

analyticsRouter.get('/donations/weekly', ctrl.getDonationsWeekly);
analyticsRouter.get('/donations/summary', ctrl.getDonationsSummary);

analyticsRouter.get('/checkin/progress', ctrl.getCheckinProgress);

analyticsRouter.get('/weekly-report', ctrl.getWeeklyReport);
