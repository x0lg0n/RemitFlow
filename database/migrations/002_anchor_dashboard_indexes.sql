-- 002_anchor_dashboard_indexes.sql
-- Performance indexes for anchor dashboard aggregations and history filters.

CREATE INDEX IF NOT EXISTS idx_transactions_anchor_created_at
  ON transactions(anchor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_anchor_status_created
  ON transactions(anchor_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_anchor_revenue_anchor_created
  ON anchor_revenue(anchor_id, created_at DESC);
