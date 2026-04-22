-- 003_sep31_callbacks.sql
-- Tables to support SEP-31 business callbacks (/customer and /rate) and firm quote commitments.

CREATE TABLE IF NOT EXISTS sep31_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account VARCHAR(56) NOT NULL,
  memo TEXT,
  memo_type VARCHAR(32) NOT NULL DEFAULT 'id',
  type VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACCEPTED',
  kyc_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sep31_customers_account_memo_type
  ON sep31_customers (account, COALESCE(memo, ''), type);

CREATE INDEX IF NOT EXISTS idx_sep31_customers_type
  ON sep31_customers (type);

CREATE TABLE IF NOT EXISTS sep31_quotes (
  id UUID PRIMARY KEY,
  anchor_id VARCHAR(50) NOT NULL REFERENCES anchors(id) ON DELETE CASCADE,
  sell_asset TEXT NOT NULL,
  buy_asset TEXT NOT NULL,
  price NUMERIC(20, 8) NOT NULL,
  fee_percent NUMERIC(10, 4) NOT NULL,
  sell_amount BIGINT NOT NULL,
  buy_amount BIGINT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sep31_quotes_expires_at
  ON sep31_quotes (expires_at);

CREATE INDEX IF NOT EXISTS idx_sep31_quotes_anchor_id
  ON sep31_quotes (anchor_id);
