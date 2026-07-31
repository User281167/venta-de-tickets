import { sweepExpiredReservations } from "../modules/payments/payments.repository.js";
import { sweepExpiredDonations } from "../modules/donaciones/donaciones.service.js";
import { logger } from "../utils/logger.js";
import { SWEEP_INTERVAL_MILLIS, DONATION_EXPIRY_INTERVAL_MILLIS } from "./config/constants.js";

let isRunning = false;
let timer: NodeJS.Timeout | null = null;
let donationIsRunning = false;
let donationTimer: NodeJS.Timeout | null = null;

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
  timer = setInterval(runSweep, SWEEP_INTERVAL_MILLIS);
  logger.info(`Sweep payments job started: intervalMs=${SWEEP_INTERVAL_MILLIS}`);
}

export function stopSweepJob() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

async function runDonationExpiry() {
  if (donationIsRunning) {
    logger.warn('Donation expiry already running, skipping this tick');
    return;
  }

  donationIsRunning = true;

  try {
    await sweepExpiredDonations();
  } catch (err) {
    logger.error(`Donation expiry failed: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    donationIsRunning = false;
  }
}

export function startDonationExpiryJob() {
  if (donationTimer) return;
  donationTimer = setInterval(runDonationExpiry, DONATION_EXPIRY_INTERVAL_MILLIS);
  logger.info(`Donation expiry job started: intervalMs=${DONATION_EXPIRY_INTERVAL_MILLIS}`);
}

export function stopDonationExpiryJob() {
  if (donationTimer) {
    clearInterval(donationTimer);
    donationTimer = null;
  }
}
