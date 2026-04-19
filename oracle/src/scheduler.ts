import cron from "node-cron";
import { fetchAllRates } from "./modules/fetcher/multi-anchor.service";
import { validateRates } from "./modules/validator/rate-validator.service";
import { publishRates } from "./modules/publisher/publisher.service";
import { logPipelineSummary } from "./modules/monitoring/alert.service";
import type { FetchedRate } from "./shared/types/oracle.types";

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MINUTES ?? "5", 10);

/**
 * Execute the full oracle pipeline:
 *   FETCH → VALIDATE → PUBLISH → MONITOR
 */
export async function runPipeline(): Promise<void> {
  console.log(`\n[Oracle Pipeline] Starting run at ${new Date().toISOString()}`);

  try {
    // Step 1: Fetch.
    const fetched = await fetchAllRates();
    const validRates = fetched.filter(
      (r: FetchedRate | null): r is FetchedRate => r !== null
    );

    if (validRates.length === 0) {
      console.log("[Oracle Pipeline] No rates fetched. Skipping.");
      return;
    }

    // Step 2: Validate.
    const { valid, rejected } = validateRates(validRates);

    if (valid.length === 0) {
      console.log("[Oracle Pipeline] No rates passed validation. Skipping publish.");
      logPipelineSummary(fetched.length, 0, rejected.length, []);
      return;
    }

    // Step 3: Publish.
    const results = await publishRates(valid);

    // Step 4: Monitor.
    logPipelineSummary(fetched.length, valid.length, rejected.length, results);
  } catch (error) {
    console.error("[Oracle Pipeline] Unhandled error:", (error as Error).message);
    console.error((error as Error).stack);
  }
}

/**
 * Start the cron-based scheduler.
 * Runs the pipeline every POLL_INTERVAL_MINUTES minutes.
 */
export function startScheduler(): void {
  const cronExpression = `*/${POLL_INTERVAL} * * * *`;
  console.log(`Oracle Scheduler: Running every ${POLL_INTERVAL} minutes (${cronExpression})`);

  // Run immediately on startup.
  runPipeline().catch((err) =>
    console.error("Oracle initial run failed:", err.message)
  );

  // Then schedule recurring runs.
  cron.schedule(cronExpression, () => {
    runPipeline().catch((err) =>
      console.error("Oracle scheduled run failed:", err.message)
    );
  });

  console.log("Oracle Scheduler started");
}
