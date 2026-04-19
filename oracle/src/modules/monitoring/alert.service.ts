import { PublishResult } from "../../shared/types/oracle.types";

/**
 * Monitor publish results and alert on failures.
 * Logs a summary of each pipeline run.
 */
export function logPipelineSummary(
  fetched: number,
  valid: number,
  rejected: number,
  results: PublishResult[]
): void {
  const contractSuccess = results.filter((r) => r.contractSuccess).length;
  const contractFailed = results.filter((r) => !r.contractSuccess).length;

  console.log("");
  console.log("══════════════════════════════════════════");
  console.log("  Oracle Pipeline Run Summary");
  console.log("══════════════════════════════════════════");
  console.log(`  Rates fetched:    ${fetched}`);
  console.log(`  Rates validated:  ${valid}`);
  console.log(`  Rates rejected:   ${rejected}`);
  console.log(`  On-chain success: ${contractSuccess}`);
  console.log(`  On-chain failed:  ${contractFailed}`);
  console.log(`  Timestamp:        ${new Date().toISOString()}`);
  console.log("══════════════════════════════════════════");
  console.log("");

  // Alert on critical failures.
  if (contractFailed > fetched * 0.5) {
    console.error(
      "⚠️  ALERT: More than 50% of on-chain publishes failed!"
    );
  }

  if (valid === 0 && fetched > 0) {
    console.error(
      "⚠️  ALERT: All fetched rates were rejected by validation!"
    );
  }
}
