-- 006_transaction_reconciliation.sql
-- Adds on-chain verification/indexing state for completed transactions.

CREATE TABLE IF NOT EXISTS transaction_reconciliation (
  transaction_id UUID PRIMARY KEY REFERENCES transactions(id) ON DELETE CASCADE,
  stellar_tx_hash TEXT NOT NULL,
  horizon_status VARCHAR(20) NOT NULL,
  horizon_ledger BIGINT,
  horizon_successful BOOLEAN,
  error_message TEXT,
  last_checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transaction_reconciliation_status_checked
  ON transaction_reconciliation(horizon_status, last_checked_at DESC);
