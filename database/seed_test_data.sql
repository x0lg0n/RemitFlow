-- seed_test_data.sql
-- Insert a test anchor
INSERT INTO anchors (
  id, 
  name, 
  stellar_address, 
  base_url, 
  auth_token,
  supported_currencies, 
  supported_countries, 
  is_active
) VALUES (
  'test_anchor_colombia',
  'Test Anchor Colombia',
  'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
  'https://api.example.com',
  'test-token-123',
  ARRAY['USDC', 'COP', 'USD'],
  ARRAY['CO', 'US'],
  true
) ON CONFLICT (id) DO NOTHING;

-- Insert sample rates for this anchor
INSERT INTO rates (
  anchor_id,
  from_currency,
  to_currency,
  destination_country,
  fee_percent,
  fx_rate,
  min_amount,
  max_amount,
  fetched_at,
  expires_at
) VALUES 
(
  'test_anchor_colombia',
  'USDC',
  'COP',
  'CO',
  1.5000,
  4250.50000000,
  1000000,
  5000000000,
  NOW(),
  NOW() + INTERVAL '24 hours'
),
(
  'test_anchor_colombia',
  'USD',
  'COP',
  'CO',
  2.0000,
  4245.75000000,
  1000000,
  5000000000,
  NOW(),
  NOW() + INTERVAL '24 hours'
)
ON CONFLICT DO NOTHING;

-- Verify data
SELECT 'Anchors:' as info;
SELECT id, name, is_active FROM anchors;
SELECT 'Rates:' as info;
SELECT anchor_id, from_currency, to_currency, fee_percent, fx_rate FROM rates;
