import { sweepExpiredReservations } from "../modules/payments/payments.repository.js";
import { logger } from "../utils/logger.js";
import { RESERVATION_EXPIRATION_CRON_MS } from "./config/constants.js";

let isRunning = false;
let timer: NodeJS.Timeout | null = null;

async function runSweep() {
  if (isRunning) {
    logger.warn('Sweep already running, skipping this tick');
    return;
  }
  isRunning = true;

  try {
    const result = await sweepExpiredReservations();

    if (result.ticketsExpired > 0) {
      logger.info(
        `Sweep completed: ticketsExpired=${result.ticketsExpired}, paymentsExpired=${result.paymentsExpired}`,
      );
    }
  } catch (err) {
    logger.error(`Sweep failed: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    isRunning = false;
  }
}

export function startSweepJob() {
  if (timer) return; // evita doble-start si se llama dos veces
  timer = setInterval(runSweep, RESERVATION_EXPIRATION_CRON_MS);
  logger.info(`Sweep job started: intervalMs=${RESERVATION_EXPIRATION_CRON_MS}`);
}

export function stopSweepJob() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
