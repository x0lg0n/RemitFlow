#!/bin/bash

# RemitFlow Docker Environment Setup Script
# This script helps you generate a secure .env file for Docker services

set -e

ENV_FILE="docker/.env"
EXAMPLE_FILE="docker/.env.example"

echo "🔐 RemitFlow Docker Environment Setup"
echo "======================================"
echo ""

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  Warning: $ENV_FILE already exists!"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted. Existing .env file preserved."
        exit 1
    fi
fi

# Copy example file
echo "📋 Creating $ENV_FILE from template..."
cp "$EXAMPLE_FILE" "$ENV_FILE"

# Generate secure JWT Secret
echo "🔑 Generating secure JWT secret..."
JWT_SECRET=$(openssl rand -base64 32)
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" "$ENV_FILE"

# Generate SEP-10 Server Secret
echo "🔑 Generating SEP-10 server secret..."
# Generate a random string for demo purposes
# In production, use: stellar keys generate --network testnet
SEP10_SECRET=$(openssl rand -hex 32)
sed -i "s|SEP10_SERVER_SECRET=.*|SEP10_SERVER_SECRET=$SEP10_SECRET|g" "$ENV_FILE"

# Generate Oracle Secret Key
echo "🔑 Generating Oracle secret key..."
ORACLE_SECRET=$(openssl rand -hex 32)
sed -i "s|ORACLE_SECRET_KEY=.*|ORACLE_SECRET_KEY=$ORACLE_SECRET|g" "$ENV_FILE"

# Generate Database Password
echo "🔑 Generating secure database password..."
DB_PASSWORD=$(openssl rand -base64 24)
sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$DB_PASSWORD|g" "$ENV_FILE"
sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:$DB_PASSWORD@db:5432/remiflow|g" "$ENV_FILE"

echo ""
echo "✅ Environment file created successfully: $ENV_FILE"
echo ""
echo "📝 Next steps:"
echo "   1. Review and edit $ENV_FILE if needed"
echo "   2. Add your anchor API credentials in ANCHOR_CONFIGS"
echo "   3. Run: cd docker && docker-compose up -d"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - NEVER commit $ENV_FILE to Git (already in .gitignore)"
echo "   - Keep this file secure and backup in a password manager"
echo "   - For production, use stronger secrets and rotate regularly"
echo ""
echo "🔍 To view your secrets:"
echo "   cat $ENV_FILE | grep -v '^#' | grep -v '^$'"
echo ""
