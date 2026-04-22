/** Request body for POST /rates/best. */
export interface RateRequest {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
}

/** Rate data for a single anchor and corridor. */
export interface AnchorRate {
  anchorId: string;
  anchorName: string;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
  feeBps: number;
  feePercent: number;
  fxRate: number;
  minAmount: number;
  maxAmount: number;
  lastUpdated: Date | null;
  estimatedArrival: string | null;
}

/** Response for the best route query. */
export interface BestRouteResponse {
  anchorId: string;
  anchorName: string;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
  feeBps: number;
  feePercent: number;
  fxRate: number;
  totalFee: number;
  totalCost: number;
  destinationAmount: number;
  estimatedArrival: string | null;
  savingsVsAverage: number;
}

/** Raw rate row from the database. */
export interface RateRow {
  id: string;
  anchor_id: string;
  from_currency: string;
  to_currency: string;
  destination_country: string;
  fee_percent: string; // PostgreSQL NUMERIC returns as string
  fx_rate: string;     // PostgreSQL NUMERIC returns as string
  min_amount: string;  // PostgreSQL BIGINT returns as string
  max_amount: string;  // PostgreSQL BIGINT returns as string
  fetched_at: Date;
  expires_at: Date;
  name: string;
}

/** Convert a database rate row to a clean AnchorRate. */
export function rowToAnchorRate(row: RateRow): AnchorRate {
  const feePercent = parseFloat(row.fee_percent as unknown as string);
  const fxRate = parseFloat(row.fx_rate as unknown as string);
  const feeBps = Math.round(feePercent * 100);
  
  return {
    anchorId: row.anchor_id,
    anchorName: row.name,
    fromCurrency: row.from_currency,
    toCurrency: row.to_currency,
    destinationCountry: row.destination_country,
    feeBps,
    feePercent,
    fxRate,
    minAmount: parseInt(row.min_amount as unknown as string, 10),
    maxAmount: parseInt(row.max_amount as unknown as string, 10),
    lastUpdated: row.fetched_at,
    estimatedArrival: null,
  };
}
