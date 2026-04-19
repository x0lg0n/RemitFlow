import { pool } from "../../shared/config/database";
import { redis } from "../../shared/config/redis";
import { ValidatedRate } from "../../shared/types/oracle.types";

const CACHE_TTL_SECONDS = 300; // 5 minutes

/**
 * Persist validated rates to PostgreSQL and cache in Redis.
 */
export async function publishToDatabase(rates: ValidatedRate[]): Promise<void> {
  if (rates.length === 0) return;

  const values: string[] = [];
  const placeholders: string[] = [];

  for (let i = 0; i < rates.length; i++) {
    const r = rates[i];
    const offset = i * 10;
    placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10})`
    );
    values.push(
      r.anchorId,
      r.fromCurrency,
      r.toCurrency,
      r.destinationCountry,
      r.feePercent.toString(),
      r.fxRate.toString(),
      r.minAmount.toString(),
      r.maxAmount.toString(),
      r.fetchedAt.toISOString(),
      new Date(Date.now() + 600_000).toISOString() // expires_at = now + 10 min
    );
  }

  await pool.query(
    `INSERT INTO rates (
       anchor_id,
       from_currency,
       to_currency,
       destination_country,
       fee_percent,
       fx_rate,
       min_amount,
       max_amount,
       fetched_at,
       expires_at
     )
     VALUES ${placeholders.join(", ")}
     ON CONFLICT (anchor_id, from_currency, to_currency, destination_country) DO UPDATE SET
       fee_percent = EXCLUDED.fee_percent,
       fx_rate = EXCLUDED.fx_rate,
       min_amount = EXCLUDED.min_amount,
       max_amount = EXCLUDED.max_amount,
       fetched_at = EXCLUDED.fetched_at,
       expires_at = EXCLUDED.expires_at`,
    values
  );

  console.log(`Oracle DB: Upserted ${rates.length} rates`);

  // Cache in Redis.
  for (const rate of rates) {
    await redis.setex(
      `rate:${rate.anchorId}:${rate.fromCurrency}:${rate.toCurrency}:${rate.destinationCountry}`,
      CACHE_TTL_SECONDS,
      JSON.stringify({
        fromCurrency: rate.fromCurrency,
        toCurrency: rate.toCurrency,
        destinationCountry: rate.destinationCountry,
        feePercent: rate.feePercent,
        fxRate: rate.fxRate,
        minAmount: rate.minAmount,
        maxAmount: rate.maxAmount,
        lastUpdated: rate.fetchedAt.toISOString(),
      })
    );
  }

  console.log(`Oracle Redis: Cached ${rates.length} rates (TTL ${CACHE_TTL_SECONDS}s)`);
}
