-- 005_marketplace_recurring_admin.sql
-- Adds anchor marketplace catalog/preferences/submissions, admin wallets,
-- recurring send plans/runs, and audit logging.

CREATE TABLE IF NOT EXISTS anchor_catalog (
  id VARCHAR(80) PRIMARY KEY,
  anchor_id VARCHAR(50) UNIQUE REFERENCES anchors(id) ON DELETE SET NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  country_code VARCHAR(2) NOT NULL,
  supported_currencies TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  supported_countries TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  fee_estimate VARCHAR(20),
  rating NUMERIC(2,1),
  website_url VARCHAR(255),
  signup_url VARCHAR(255),
  logo_url VARCHAR(255),
  availability_status VARCHAR(20) NOT NULL DEFAULT 'available',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_anchor_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(56) NOT NULL,
  catalog_id VARCHAR(80) NOT NULL REFERENCES anchor_catalog(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_anchor_preference UNIQUE(user_id, catalog_id)
);

CREATE TABLE IF NOT EXISTS anchor_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(56) NOT NULL,
  anchor_name VARCHAR(255) NOT NULL,
  base_url VARCHAR(255),
  country_code VARCHAR(2),
  supported_currencies TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  submission_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  review_notes TEXT,
  reviewed_by VARCHAR(56),
  reviewed_at TIMESTAMP,
  catalog_id VARCHAR(80),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_wallets (
  wallet_address VARCHAR(56) PRIMARY KEY,
  created_by VARCHAR(56),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recurring_send_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(56) NOT NULL,
  anchor_id VARCHAR(50) REFERENCES anchors(id) ON DELETE SET NULL,
  amount BIGINT NOT NULL,
  from_currency VARCHAR(10) NOT NULL,
  to_currency VARCHAR(10) NOT NULL,
  destination_country VARCHAR(2) NOT NULL,
  recipient_address VARCHAR(56) NOT NULL,
  recipient_info JSONB,
  cadence VARCHAR(20) NOT NULL,
  timezone VARCHAR(64) NOT NULL,
  next_run_at TIMESTAMP NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_run_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recurring_send_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES recurring_send_plans(id) ON DELETE CASCADE,
  user_id VARCHAR(56) NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  confirm_before TIMESTAMP NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending_confirmation',
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  failure_reason TEXT,
  executed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_recurring_run_schedule UNIQUE(plan_id, scheduled_for)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id VARCHAR(56),
  actor_role VARCHAR(20),
  action VARCHAR(80) NOT NULL,
  target_type VARCHAR(80) NOT NULL,
  target_id VARCHAR(120),
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_anchor_preferences_user_active
  ON user_anchor_preferences(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_anchor_submissions_status_created
  ON anchor_submissions(submission_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recurring_send_plans_user_active
  ON recurring_send_plans(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_recurring_send_plans_due
  ON recurring_send_plans(next_run_at, status);

CREATE INDEX IF NOT EXISTS idx_recurring_send_runs_user_status
  ON recurring_send_runs(user_id, status, confirm_before);

CREATE INDEX IF NOT EXISTS idx_audit_events_action_created
  ON audit_events(action, created_at DESC);

-- Backfill catalog from active anchors if not already present.
INSERT INTO anchor_catalog (
  id,
  anchor_id,
  display_name,
  description,
  country_code,
  supported_currencies,
  supported_countries,
  fee_estimate,
  rating,
  website_url,
  signup_url,
  logo_url,
  availability_status,
  is_published,
  notes
)
SELECT
  a.id,
  a.id,
  a.name,
  'Integrated anchor available for remittance routing.',
  COALESCE(a.supported_countries[1], 'US'),
  a.supported_currencies,
  a.supported_countries,
  NULL,
  4.5,
  NULL,
  NULL,
  NULL,
  CASE WHEN a.is_active THEN 'available' ELSE 'disabled' END,
  TRUE,
  'Auto-imported from anchors table'
FROM anchors a
ON CONFLICT (id) DO NOTHING;

-- Pre-register known anchors for marketplace discovery (pending integration).
INSERT INTO anchor_catalog (
  id,
  anchor_id,
  display_name,
  description,
  country_code,
  supported_currencies,
  supported_countries,
  fee_estimate,
  rating,
  website_url,
  signup_url,
  logo_url,
  availability_status,
  is_published,
  notes
)
VALUES
  (
    'vibrant_colombia',
    NULL,
    'Vibrant - Colombia',
    'Leading Latin America anchor with competitive rates.',
    'CO',
    ARRAY['USDC', 'USD', 'COP'],
    ARRAY['CO', 'US'],
    '1.5%',
    4.8,
    'https://vibrantapp.com',
    'https://vibrantapp.com/partners',
    '/anchors/vibrant-colombia.png',
    'pending',
    TRUE,
    'Marketplace pre-registration. Awaiting technical integration.'
  ),
  (
    'vibrant_mexico',
    NULL,
    'Vibrant - Mexico',
    'Reliable USD↔MXN remittance corridor support.',
    'MX',
    ARRAY['USDC', 'USD', 'MXN'],
    ARRAY['MX', 'US'],
    '1.75%',
    4.7,
    'https://vibrantapp.com',
    'https://vibrantapp.com/partners',
    '/anchors/vibrant-mexico.png',
    'pending',
    TRUE,
    'Marketplace pre-registration. Awaiting technical integration.'
  ),
  (
    'bantr_nigeria',
    NULL,
    'Bantr - Nigeria',
    'Strong liquidity for USD↔NGN corridors.',
    'NG',
    ARRAY['USDC', 'USD', 'NGN'],
    ARRAY['NG', 'US'],
    '2.0%',
    4.4,
    'https://bantr.co',
    'https://bantr.co/partners',
    '/anchors/bantr-nigeria.png',
    'pending',
    TRUE,
    'Marketplace pre-registration. Awaiting technical integration.'
  )
ON CONFLICT (id) DO NOTHING;
