-- 001_schema_bootstrap.sql
-- Idempotent baseline schema for RemitFlow services.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS anchors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  stellar_address VARCHAR(56) NOT NULL,
  base_url VARCHAR(255) NOT NULL,
  auth_token VARCHAR(255) NOT NULL,
  supported_currencies TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  supported_countries TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id VARCHAR(50) NOT NULL,
  from_currency VARCHAR(10) NOT NULL,
  to_currency VARCHAR(10) NOT NULL,
  destination_country VARCHAR(2) NOT NULL,
  fee_percent NUMERIC(10, 4) NOT NULL,
  fx_rate NUMERIC(20, 8) NOT NULL,
  min_amount BIGINT NOT NULL,
  max_amount BIGINT NOT NULL,
  fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_rates_anchor_id FOREIGN KEY (anchor_id) REFERENCES anchors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stellar_tx_hash VARCHAR(64) UNIQUE,
  user_id VARCHAR(56) NOT NULL,
  anchor_id VARCHAR(50) NOT NULL,
  amount BIGINT NOT NULL,
  fee BIGINT NOT NULL,
  from_currency VARCHAR(10) NOT NULL,
  to_currency VARCHAR(10) NOT NULL,
  destination_country VARCHAR(2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  recipient_address VARCHAR(56),
  recipient_info JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  CONSTRAINT fk_transactions_anchor_id FOREIGN KEY (anchor_id) REFERENCES anchors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS anchor_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id VARCHAR(50) NOT NULL,
  transaction_id UUID,
  revenue_amount BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_anchor_revenue_anchor_id FOREIGN KEY (anchor_id) REFERENCES anchors(id) ON DELETE CASCADE,
  CONSTRAINT fk_anchor_revenue_tx_id FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);

-- Backfill/repair columns for existing tables.
ALTER TABLE rates ADD COLUMN IF NOT EXISTS from_currency VARCHAR(10);
ALTER TABLE rates ADD COLUMN IF NOT EXISTS to_currency VARCHAR(10);
ALTER TABLE rates ADD COLUMN IF NOT EXISTS destination_country VARCHAR(2);

UPDATE rates SET from_currency = COALESCE(from_currency, 'USDC');
UPDATE rates SET to_currency = COALESCE(to_currency, 'COP');
UPDATE rates SET destination_country = COALESCE(destination_country, 'CO');

ALTER TABLE rates ALTER COLUMN from_currency SET NOT NULL;
ALTER TABLE rates ALTER COLUMN to_currency SET NOT NULL;
ALTER TABLE rates ALTER COLUMN destination_country SET NOT NULL;

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS destination_country VARCHAR(2);
UPDATE transactions SET destination_country = COALESCE(destination_country, 'CO');
ALTER TABLE transactions ALTER COLUMN destination_country SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_anchors_stellar_address_unique
  ON anchors (stellar_address);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rates_anchor_corridor_unique
  ON rates (anchor_id, from_currency, to_currency, destination_country);

CREATE INDEX IF NOT EXISTS idx_rates_corridor_lookup
  ON rates (from_currency, to_currency, destination_country, expires_at);

CREATE INDEX IF NOT EXISTS idx_rates_anchor_id
  ON rates (anchor_id);

CREATE INDEX IF NOT EXISTS idx_rates_expires_at
  ON rates (expires_at);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id
  ON transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_anchor_id
  ON transactions(anchor_id);

CREATE INDEX IF NOT EXISTS idx_transactions_status
  ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at
  ON transactions(created_at);
