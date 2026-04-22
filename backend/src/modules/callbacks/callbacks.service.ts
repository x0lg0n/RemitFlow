import { randomUUID } from "node:crypto";
import { pool } from "../../shared/config/database";

interface Sep31CustomerRow {
  id: string;
  account: string;
  memo: string | null;
  memo_type: string | null;
  type: string;
  status: string;
  kyc_data: Record<string, unknown>;
}

interface RateLookupRow {
  anchor_id: string;
  fee_percent: number;
  fx_rate: number;
}

function assetToCode(asset: string): string {
  const parts = asset.split(":");
  if (parts.length < 2) return asset.toUpperCase();
  return parts[1].toUpperCase();
}

export async function upsertCustomer(payload: Record<string, unknown>): Promise<{ id: string }> {
  const { account, memo, memo_type, type, ...kycFields } = payload as {
    account: string;
    memo?: string;
    memo_type?: string;
    type: string;
  };

  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO sep31_customers (account, memo, memo_type, type, status, kyc_data)
     VALUES ($1, $2, COALESCE($3, 'id'), $4, 'ACCEPTED', $5)
     ON CONFLICT (account, COALESCE(memo, ''), type) DO UPDATE SET
       memo_type = EXCLUDED.memo_type,
       status = 'ACCEPTED',
       kyc_data = EXCLUDED.kyc_data,
       updated_at = NOW()
     RETURNING id`,
    [account, memo ?? null, memo_type ?? null, type, kycFields]
  );

  return { id: rows[0].id };
}

export async function getCustomer(query: {
  id?: string;
  account?: string;
  memo?: string;
  type: string;
}): Promise<Sep31CustomerRow | null> {
  if (query.id) {
    const { rows } = await pool.query<Sep31CustomerRow>(
      `SELECT id, account, memo, memo_type, type, status, kyc_data
       FROM sep31_customers
       WHERE id = $1 AND type = $2
       LIMIT 1`,
      [query.id, query.type]
    );
    return rows[0] ?? null;
  }

  const { rows } = await pool.query<Sep31CustomerRow>(
    `SELECT id, account, memo, memo_type, type, status, kyc_data
     FROM sep31_customers
     WHERE account = $1
       AND COALESCE(memo, '') = COALESCE($2, '')
       AND type = $3
     LIMIT 1`,
    [query.account ?? null, query.memo ?? null, query.type]
  );
  return rows[0] ?? null;
}

export async function deleteCustomer(query: { id: string; type: string }): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM sep31_customers WHERE id = $1 AND type = $2",
    [query.id, query.type]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function buildRateQuote(query: {
  type: "indicative" | "firm";
  sell_asset: string;
  buy_asset: string;
  sell_amount?: number;
  buy_amount?: number;
  expires_after?: string;
  country_code?: string;
  destination_country?: string;
}): Promise<Record<string, unknown>> {
  const fromCurrency = assetToCode(query.sell_asset);
  const toCurrency = assetToCode(query.buy_asset);
  const corridorCountry = (query.destination_country ?? query.country_code ?? "").toUpperCase();

  const params: Array<string | number> = [fromCurrency, toCurrency];
  const countryClause = corridorCountry
    ? "AND destination_country = $3"
    : "";

  if (corridorCountry) params.push(corridorCountry);

  let { rows } = await pool.query<RateLookupRow>(
    `SELECT anchor_id, fee_percent::float8 AS fee_percent, fx_rate::float8 AS fx_rate
     FROM rates
     WHERE from_currency = $1
       AND to_currency = $2
       ${countryClause}
       AND expires_at > NOW()
     ORDER BY fee_percent ASC, fetched_at DESC
     LIMIT 1`,
    params
  );

  if (rows.length === 0) {
    const fallbackResult = await pool.query<RateLookupRow>(
      `SELECT anchor_id, fee_percent::float8 AS fee_percent, fx_rate::float8 AS fx_rate
       FROM rates
       WHERE from_currency = $1
         AND to_currency = $2
         ${countryClause}
       ORDER BY fetched_at DESC
       LIMIT 1`,
      params
    );

    rows = fallbackResult.rows;
  }

  if (rows.length === 0) {
    throw new Error("No quote available for requested corridor");
  }

  const rate = rows[0];
  const sellAmount = query.sell_amount ?? (query.buy_amount ? query.buy_amount / rate.fx_rate : 0);
  const feeAmount = sellAmount * (rate.fee_percent / 100);
  const buyAmount = query.buy_amount ?? (sellAmount - feeAmount) * rate.fx_rate;

  const response: Record<string, unknown> = {
    price: rate.fx_rate.toFixed(8),
    total_price: rate.fx_rate.toFixed(8),
    sell_amount: Math.round(sellAmount).toString(),
    buy_amount: Math.round(buyAmount).toString(),
    fee: {
      total: Math.round(feeAmount).toString(),
      asset: query.sell_asset,
    },
    sell_asset: query.sell_asset,
    buy_asset: query.buy_asset,
  };

  if (query.type === "firm") {
    const requestedFloor = query.expires_after ? new Date(query.expires_after) : null;
    const defaultExpiry = new Date(Date.now() + 5 * 60 * 1000);
    const expiresAt = requestedFloor && requestedFloor.getTime() > defaultExpiry.getTime()
      ? requestedFloor
      : defaultExpiry;

    const quoteId = randomUUID();
    await pool.query(
      `INSERT INTO sep31_quotes (id, anchor_id, sell_asset, buy_asset, price, fee_percent, sell_amount, buy_amount, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        quoteId,
        rate.anchor_id,
        query.sell_asset,
        query.buy_asset,
        rate.fx_rate,
        rate.fee_percent,
        Math.round(sellAmount),
        Math.round(buyAmount),
        expiresAt,
      ]
    );

    response.id = quoteId;
    response.expires_at = expiresAt.toISOString();
  }

  return response;
}
