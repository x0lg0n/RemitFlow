import { pool } from "../../shared/config/database";
import { redis } from "../../shared/config/redis";
import {
  AnchorRate,
  BestRouteResponse,
  RateRequest,
  RateRow,
  rowToAnchorRate,
} from "../../shared/types/rate.types";

const RATES_CACHE_TTL = 60; // seconds

/** Fetch all active anchor rates from the database (with Redis cache). */
export async function getAllActiveRates(): Promise<AnchorRate[]> {
  const cacheKey = "rates:all_active";
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as AnchorRate[];

  const { rows } = await pool.query<RateRow>(
    `SELECT r.*, a.name
     FROM rates r
     JOIN anchors a ON r.anchor_id = a.id
     WHERE a.is_active = true
       AND r.expires_at > NOW()
     ORDER BY r.fee_percent ASC, r.fx_rate DESC`
  );

  const rates = rows.map(rowToAnchorRate);
  await redis.setex(cacheKey, RATES_CACHE_TTL, JSON.stringify(rates));
  return rates;
}

/** Find the cheapest route for the given request. */
export async function findBestRoute(
  request: RateRequest
): Promise<BestRouteResponse | null> {
  const rates = await getAllActiveRates();
  return computeBestRoute(rates, request);
}

/** Deterministically compute the cheapest route from a rate list. */
export function computeBestRoute(
  rates: AnchorRate[],
  request: RateRequest
): BestRouteResponse | null {

  // Filter by corridor, destination country, and amount range.
  const eligible = rates.filter(
    (r) =>
      r.fromCurrency === request.fromCurrency &&
      r.toCurrency === request.toCurrency &&
      r.destinationCountry === request.destinationCountry &&
      request.amount >= r.minAmount &&
      request.amount <= r.maxAmount
  );

  if (eligible.length === 0) return null;

  // Calculate costs and pick the cheapest.
  const results: BestRouteResponse[] = eligible.map((r) => {
    const fee = Math.round(request.amount * (r.feePercent / 100));
    const totalCost = request.amount + fee;
    const destinationAmount = Math.floor(request.amount * r.fxRate);

    return {
      anchorId: r.anchorId,
      anchorName: r.anchorName,
      fromCurrency: r.fromCurrency,
      toCurrency: r.toCurrency,
      destinationCountry: r.destinationCountry,
      feeBps: r.feeBps,
      feePercent: r.feePercent,
      fxRate: r.fxRate,
      totalFee: fee,
      totalCost,
      destinationAmount,
      estimatedArrival: r.estimatedArrival,
      savingsVsAverage: 0,
    };
  });

  results.sort((a, b) => a.totalCost - b.totalCost);
  const best = results[0];

  // Calculate savings vs average of all eligible routes.
  const avgCost =
    results.reduce((sum, r) => sum + r.totalCost, 0) / results.length;
  const savingsVsAverage =
    avgCost > 0
      ? parseFloat((((avgCost - best.totalCost) / avgCost) * 100).toFixed(2))
      : 0;

  return { ...best, savingsVsAverage };
}
