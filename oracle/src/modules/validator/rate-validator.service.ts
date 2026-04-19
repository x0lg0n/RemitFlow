import { FetchedRate, ValidationResult, ValidatedRate } from "../../shared/types/oracle.types";

const MAX_DEVIATION_PERCENT = parseInt(
  process.env.MAX_DEVIATION_PERCENT ?? "5",
  10
);

const failureCounts = new Map<string, number>();

/**
 * Validate fetched rates using corridor-level deviation checking.
 * Rejects rates that deviate more than MAX_DEVIATION_PERCENT from the median.
 * Implements a circuit breaker: after MAX_CONSECUTIVE_FAILURES, the anchor
 * is skipped until the next successful fetch.
 */
export function validateRates(rates: FetchedRate[]): ValidationResult {
  const maxFailures = parseInt(
    process.env.MAX_CONSECUTIVE_FAILURES ?? "3",
    10
  );

  const valid: ValidatedRate[] = [];
  const rejected: { anchorId: string; reason: string }[] = [];

  if (rates.length === 0) return { valid, rejected };

  // Build corridor medians so validation compares like-for-like corridors.
  const corridorMedians = new Map<string, number>();
  const corridorBuckets = new Map<string, number[]>();

  for (const rate of rates) {
    const key = corridorKey(rate);
    const bucket = corridorBuckets.get(key) ?? [];
    bucket.push(rate.feePercent);
    corridorBuckets.set(key, bucket);
  }

  for (const [key, values] of corridorBuckets.entries()) {
    values.sort((a, b) => a - b);
    const median =
      values.length % 2 === 1
        ? values[Math.floor(values.length / 2)]
        : (values[values.length / 2 - 1] + values[values.length / 2]) / 2;
    corridorMedians.set(key, median);
  }

  for (const rate of rates) {
    // Check circuit breaker.
    const failures = failureCounts.get(rate.anchorId) ?? 0;
    if (failures >= maxFailures) {
      rejected.push({
        anchorId: rate.anchorId,
        reason: `Circuit breaker: ${failures} consecutive failures`,
      });
      continue;
    }

    const key = corridorKey(rate);
    const medianFee = corridorMedians.get(key) ?? 0;

    // Check deviation from corridor median.
    if (medianFee > 0) {
      const deviation =
        (Math.abs(rate.feePercent - medianFee) / medianFee) * 100;
      if (deviation > MAX_DEVIATION_PERCENT) {
        rejected.push({
          anchorId: rate.anchorId,
          reason: `Fee deviation ${deviation.toFixed(1)}% exceeds max ${MAX_DEVIATION_PERCENT}%`,
        });
        recordFailure(rate.anchorId);
        continue;
      }
    }

    // Check for zero/negative rates.
    if (rate.feePercent <= 0 || rate.fxRate <= 0) {
      rejected.push({
        anchorId: rate.anchorId,
        reason: "Invalid fee or FX rate (<= 0)",
      });
      recordFailure(rate.anchorId);
      continue;
    }

    // Rate is valid.
    valid.push({ ...rate, isValid: true });
    resetFailures(rate.anchorId);
  }

  console.log(
    `Oracle Validation: ${valid.length} valid, ${rejected.length} rejected`
  );
  if (rejected.length > 0) {
    for (const r of rejected) {
      console.log(`  REJECTED [${r.anchorId}]: ${r.reason}`);
    }
  }

  return { valid, rejected };
}

function corridorKey(rate: FetchedRate): string {
  return `${rate.fromCurrency}:${rate.toCurrency}:${rate.destinationCountry}`;
}

function recordFailure(anchorId: string): void {
  const current = failureCounts.get(anchorId) ?? 0;
  failureCounts.set(anchorId, current + 1);
}

function resetFailures(anchorId: string): void {
  failureCounts.set(anchorId, 0);
}
