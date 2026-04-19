import { pool } from "../../shared/config/database";
import { redis } from "../../shared/config/redis";
import {
  Anchor,
  AnchorDashboardData,
  AnchorRow,
  rowToAnchor,
} from "../../shared/types/anchor.types";

/** List all anchors (admin view includes all, public only active). */
export async function listAnchors(includeInactive = false): Promise<Anchor[]> {
  const query = includeInactive
    ? "SELECT * FROM anchors ORDER BY created_at DESC"
    : "SELECT * FROM anchors WHERE is_active = true ORDER BY created_at DESC";

  const { rows } = await pool.query<AnchorRow>(query);
  return rows.map(rowToAnchor);
}

/** Get a single anchor by ID. */
export async function getAnchorById(id: string): Promise<Anchor | null> {
  const { rows } = await pool.query<AnchorRow>(
    "SELECT * FROM anchors WHERE id = $1",
    [id]
  );
  return rows.length ? rowToAnchor(rows[0]) : null;
}

/** Register a new anchor. Admin only. */
export async function registerAnchor(data: {
  id: string;
  name: string;
  stellarAddress: string;
  baseUrl: string;
  authToken: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
}): Promise<Anchor> {
  const { rows } = await pool.query<AnchorRow>(
    `INSERT INTO anchors (id, name, stellar_address, base_url, auth_token,
       supported_currencies, supported_countries, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true)
     RETURNING *`,
    [
      data.id,
      data.name,
      data.stellarAddress,
      data.baseUrl,
      data.authToken,
      data.supportedCurrencies,
      data.supportedCountries,
    ]
  );

  // Invalidate rates cache.
  await redis.del("rates:all_active");
  return rowToAnchor(rows[0]);
}

/** Update an anchor's active status. */
export async function updateAnchorActive(
  id: string,
  isActive: boolean
): Promise<Anchor | null> {
  const { rows } = await pool.query<AnchorRow>(
    "UPDATE anchors SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [isActive, id]
  );

  await redis.del("rates:all_active");
  return rows.length ? rowToAnchor(rows[0]) : null;
}

/** Load dashboard metrics for an anchor. */
export async function getAnchorDashboard(anchorId: string): Promise<AnchorDashboardData | null> {
  const anchor = await getAnchorById(anchorId);
  if (!anchor) return null;

  const [allTime, thisWeek, lastWeek, recentTx, trends] = await Promise.all([
    pool.query<{ total_volume: string; total_transactions: string; revenue: string }>(
      `SELECT
         COALESCE(SUM(amount + fee), 0)::text AS total_volume,
         COUNT(*)::text AS total_transactions,
         COALESCE(SUM(fee), 0)::text AS revenue
       FROM transactions
       WHERE anchor_id = $1`,
      [anchorId]
    ),
    pool.query<{ total_volume: string; total_transactions: string; revenue: string }>(
      `SELECT
         COALESCE(SUM(amount + fee), 0)::text AS total_volume,
         COUNT(*)::text AS total_transactions,
         COALESCE(SUM(fee), 0)::text AS revenue
       FROM transactions
       WHERE anchor_id = $1
         AND created_at >= NOW() - INTERVAL '7 days'`,
      [anchorId]
    ),
    pool.query<{ total_volume: string; total_transactions: string; revenue: string }>(
      `SELECT
         COALESCE(SUM(amount + fee), 0)::text AS total_volume,
         COUNT(*)::text AS total_transactions,
         COALESCE(SUM(fee), 0)::text AS revenue
       FROM transactions
       WHERE anchor_id = $1
         AND created_at >= NOW() - INTERVAL '14 days'
         AND created_at < NOW() - INTERVAL '7 days'`,
      [anchorId]
    ),
    pool.query<{
      id: string;
      amount: string;
      fee: string;
      from_currency: string;
      to_currency: string;
      status: string;
      created_at: Date;
    }>(
      `SELECT id, amount::text, fee::text, from_currency, to_currency, status, created_at
       FROM transactions
       WHERE anchor_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [anchorId]
    ),
    pool.query<{ day: string; volume: string; transactions: string }>(
      `SELECT
         TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD') AS day,
         COALESCE(SUM(amount + fee), 0)::text AS volume,
         COUNT(*)::text AS transactions
       FROM transactions
       WHERE anchor_id = $1
         AND created_at >= NOW() - INTERVAL '14 days'
       GROUP BY DATE_TRUNC('day', created_at)
       ORDER BY DATE_TRUNC('day', created_at) ASC`,
      [anchorId]
    ),
  ]);

  const allTimeRow = allTime.rows[0];
  const thisWeekRow = thisWeek.rows[0];
  const lastWeekRow = lastWeek.rows[0];

  const thisWeekVolume = Number(thisWeekRow?.total_volume ?? 0);
  const thisWeekTx = Number(thisWeekRow?.total_transactions ?? 0);
  const thisWeekRevenue = Number(thisWeekRow?.revenue ?? 0);

  const lastWeekVolume = Number(lastWeekRow?.total_volume ?? 0);
  const lastWeekTx = Number(lastWeekRow?.total_transactions ?? 0);
  const lastWeekRevenue = Number(lastWeekRow?.revenue ?? 0);

  const percentageDelta = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  };

  return {
    anchorId: anchor.id,
    anchorName: anchor.name,
    kpis: {
      totalVolume: Number(allTimeRow?.total_volume ?? 0),
      totalTransactions: Number(allTimeRow?.total_transactions ?? 0),
      revenue: Number(allTimeRow?.revenue ?? 0),
      weeklyVolumeChangePct: percentageDelta(thisWeekVolume, lastWeekVolume),
      weeklyTransactionsChangePct: percentageDelta(thisWeekTx, lastWeekTx),
      weeklyRevenueChangePct: percentageDelta(thisWeekRevenue, lastWeekRevenue),
    },
    trends: trends.rows.map((row) => ({
      date: row.day,
      volume: Number(row.volume),
      transactions: Number(row.transactions),
    })),
    recentTransactions: recentTx.rows.map((row) => ({
      id: row.id,
      amount: Number(row.amount),
      fee: Number(row.fee),
      fromCurrency: row.from_currency,
      toCurrency: row.to_currency,
      status: row.status,
      createdAt: row.created_at,
    })),
  };
}
