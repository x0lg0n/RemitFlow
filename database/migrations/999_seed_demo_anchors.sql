-- 999_seed_demo_anchors.sql
-- Automatically seed demo anchors on first database initialization
-- This file runs AFTER all migrations (numbered 001-998)

-- Only seed if no anchors exist (prevents duplicates on restart)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM anchors LIMIT 1) THEN
    -- Insert demo anchor 1: Colombia corridor
    INSERT INTO anchors (
      id, name, stellar_address, base_url, auth_token,
      supported_currencies, supported_countries, is_active
    ) VALUES 
    (
      'demo_colombia',
      'Demo Anchor Colombia',
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      'https://demo-anchor.example.com',
      'demo-token-colombia',
      ARRAY['USDC', 'USD', 'COP'],
      ARRAY['CO', 'US'],
      true
    ),
    (
      'demo_mexico',
      'Demo Anchor Mexico',
      'GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      'https://demo-anchor-mx.example.com',
      'demo-token-mexico',
      ARRAY['USDC', 'USD', 'MXN'],
      ARRAY['MX', 'US'],
      true
    ),
    (
      'demo_brazil',
      'Demo Anchor Brazil',
      'GCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
      'https://demo-anchor-br.example.com',
      'demo-token-brazil',
      ARRAY['USDC', 'USD', 'BRL'],
      ARRAY['BR', 'US'],
      true
    );

    -- Insert demo rates for Colombia
    INSERT INTO rates (
      anchor_id, from_currency, to_currency, destination_country,
      fee_percent, fx_rate, min_amount, max_amount,
      fetched_at, expires_at
    ) VALUES
    -- Colombia rates (min: 1.00, max: 500,000.00 in major units)
    ('demo_colombia', 'USDC', 'COP', 'CO', 1.50, 4250.50, 100, 50000000, NOW(), NOW() + INTERVAL '24 hours'),
    ('demo_colombia', 'USD', 'COP', 'CO', 2.00, 4245.75, 100, 50000000, NOW(), NOW() + INTERVAL '24 hours'),
    
    -- Mexico rates (min: 1.00, max: 500,000.00 in major units)
    ('demo_mexico', 'USDC', 'MXN', 'MX', 1.75, 17.25, 100, 50000000, NOW(), NOW() + INTERVAL '24 hours'),
    ('demo_mexico', 'USD', 'MXN', 'MX', 2.25, 17.20, 100, 50000000, NOW(), NOW() + INTERVAL '24 hours'),
    
    -- Brazil rates (min: 1.00, max: 500,000.00 in major units)
    ('demo_brazil', 'USDC', 'BRL', 'BR', 1.80, 5.05, 100, 50000000, NOW(), NOW() + INTERVAL '24 hours'),
    ('demo_brazil', 'USD', 'BRL', 'BR', 2.30, 5.02, 100, 50000000, NOW(), NOW() + INTERVAL '24 hours');

    RAISE NOTICE 'Demo anchors and rates seeded successfully!';
  ELSE
    RAISE NOTICE 'Database already has anchors, skipping seed.';
  END IF;
END $$;
