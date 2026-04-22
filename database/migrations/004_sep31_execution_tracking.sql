-- 004_sep31_execution_tracking.sql
-- Track external SEP-31 execution identifiers and raw callback/execution metadata.

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS external_tx_id TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS external_status TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS external_payload JSONB;

CREATE INDEX IF NOT EXISTS idx_transactions_external_tx_id
  ON transactions (external_tx_id);
