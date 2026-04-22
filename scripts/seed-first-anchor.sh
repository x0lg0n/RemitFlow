#!/bin/bash

# seed-first-anchor.sh
# This script registers your first test anchor in the RemitFlow system
# Run this after starting all services with: docker compose up -d

set -e

echo "======================================"
echo "  RemitFlow - First Anchor Seeder"
echo "======================================"
echo ""

# Configuration
BACKEND_URL="http://localhost:3001"
DB_CONTAINER="docker-db-1"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Checking if services are running...${NC}"
if ! curl -s "$BACKEND_URL/health" > /dev/null; then
    echo "❌ Backend is not running. Start it with: docker compose up -d"
    exit 1
fi
echo -e "${GREEN}✓ Backend is running${NC}"

echo ""
echo -e "${YELLOW}Step 2: Creating admin wallet...${NC}"
# Generate a test admin keypair
ADMIN_KEYPAIR=$(node -e "
const { Keypair } = require('@stellar/stellar-sdk');
const kp = Keypair.random();
console.log(kp.publicKey() + '|' + kp.secret());
" 2>/dev/null || echo "NEED_MANUAL_CREATION")

if [ "$ADMIN_KEYPAIR" == "NEED_MANUAL_CREATION" ]; then
    echo "⚠️  Node.js @stellar/stellar-sdk not found in PATH"
    echo "Please manually create a keypair or install the SDK"
    echo ""
    echo "You can use: https://laboratory.stellar.org/#account-creator?network=test"
    exit 1
fi

ADMIN_PUBLIC=$(echo $ADMIN_KEYPAIR | cut -d'|' -f1)
ADMIN_SECRET=$(echo $ADMIN_KEYPAIR | cut -d'|' -f2)

echo -e "${GREEN}✓ Admin wallet created${NC}"
echo "  Public Key: $ADMIN_PUBLIC"
echo "  Secret Key: $ADMIN_SECRET"
echo ""
echo "⚠️  Save these keys! You'll need the secret key to sign transactions."

echo ""
echo -e "${YELLOW}Step 3: Creating test anchor wallet...${NC}"
ANCHOR_KEYPAIR=$(node -e "
const { Keypair } = require('@stellar/stellar-sdk');
const kp = Keypair.random();
console.log(kp.publicKey() + '|' + kp.secret());
")

ANCHOR_PUBLIC=$(echo $ANCHOR_KEYPAIR | cut -d'|' -f1)
ANCHOR_SECRET=$(echo $ANCHOR_KEYPAIR | cut -d'|' -f2)

echo -e "${GREEN}✓ Anchor wallet created${NC}"
echo "  Public Key: $ANCHOR_PUBLIC"
echo "  Secret Key: $ANCHOR_SECRET"

echo ""
echo -e "${YELLOW}Step 4: Funding testnet accounts...${NC}"
echo "⚠️  You need to fund these accounts on Stellar Testnet"
echo ""
echo "Visit: https://laboratory.stellar.org/#account-creator?network=test"
echo "1. Enter Public Key: $ADMIN_PUBLIC"
echo "2. Click 'Create Account'"
echo ""
echo "Visit: https://laboratory.stellar.org/#account-creator?network=test"
echo "1. Enter Public Key: $ANCHOR_PUBLIC"
echo "2. Click 'Create Account'"
echo ""

read -p "Press Enter after funding both accounts..."

echo ""
echo -e "${YELLOW}Step 5: Registering test anchor in database...${NC}"

# Insert anchor directly into database (bypassing auth for initial setup)
docker compose exec -T db psql -U postgres -d remitflow <<EOF
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
  '$ANCHOR_PUBLIC',
  'https://testanchor.stellar.org',
  'test-token-dev-12345',
  ARRAY['USDC', 'COP', 'USD'],
  ARRAY['CO', 'US'],
  true
) ON CONFLICT (id) DO NOTHING;
EOF

echo -e "${GREEN}✓ Anchor registered in database${NC}"

echo ""
echo -e "${YELLOW}Step 6: Verifying anchor...${NC}"
sleep 2

ANCHOR_RESPONSE=$(curl -s "$BACKEND_URL/anchors")
echo "$ANCHOR_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ANCHOR_RESPONSE"

echo ""
echo -e "${YELLOW}Step 7: Updating Oracle configuration...${NC}"

# Update oracle .env file
ORACLE_ENV="../oracle/.env"
if [ -f "$ORACLE_ENV" ]; then
    # Backup original
    cp "$ORACLE_ENV" "${ORACLE_ENV}.backup"
    
    # Update ANCHOR_CONFIGS
    sed -i "s|^ANCHOR_CONFIGS=.*|ANCHOR_CONFIGS=test_anchor_colombia|https://testanchor.stellar.org|test-token-dev-12345|" "$ORACLE_ENV"
    
    echo -e "${GREEN}✓ Oracle configuration updated${NC}"
    echo "  Restart oracle with: docker compose up -d oracle --force-recreate"
else
    echo "⚠️  Oracle .env file not found at $ORACLE_ENV"
    echo "  Please manually update ANCHOR_CONFIGS in oracle/.env"
fi

echo ""
echo "======================================"
echo -e "${GREEN}  Setup Complete!${NC}"
echo "======================================"
echo ""
echo "Summary:"
echo "  • Admin wallet: $ADMIN_PUBLIC"
echo "  • Anchor wallet: $ANCHOR_PUBLIC"
echo "  • Anchor ID: test_anchor_colombia"
echo ""
echo "Next Steps:"
echo "  1. Fund both accounts on Stellar Testnet (if not done)"
echo "  2. Restart oracle: docker compose up -d oracle --force-recreate"
echo "  3. Check oracle logs: docker compose logs -f oracle"
echo "  4. Test authentication with admin wallet"
echo "  5. Visit frontend: http://localhost:3000"
echo ""
echo "⚠️  IMPORTANT: This is for DEVELOPMENT only!"
echo "   - Do not use these keys in production"
echo "   - The anchor URL is a placeholder"
echo "   - You need to integrate with REAL anchors for production"
echo ""
