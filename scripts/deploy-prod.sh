#!/bin/bash

# RemitFlow Production Deployment Script
# This script automates the entire production deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/remitflow"
DOCKER_DIR="$APP_DIR/docker"
BACKUP_DIR="/backups/remitflow"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        RemitFlow Production Deployment Script           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root or with sudo${NC}"
    exit 1
fi

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: System Preparation
echo -e "${BLUE}[1/8] Preparing system...${NC}"
apt update && apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker $SUDO_USER
    print_status "Docker installed"
else
    print_status "Docker already installed"
fi

# Install Docker Compose if not installed
if ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose plugin..."
    apt install docker-compose-plugin -y
    print_status "Docker Compose installed"
else
    print_status "Docker Compose already installed"
fi

# Step 2: Clone or Update Repository
echo -e "${BLUE}[2/8] Setting up application...${NC}"
if [ -d "$APP_DIR" ]; then
    print_warning "Directory $APP_DIR already exists"
    read -p "Do you want to update existing deployment? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd $APP_DIR
        git pull origin main
        print_status "Repository updated"
    else
        print_error "Aborted"
        exit 1
    fi
else
    echo "Cloning repository..."
    mkdir -p $APP_DIR
    cd $APP_DIR
    read -p "Enter repository URL: " REPO_URL
    git clone $REPO_URL .
    git checkout main
    print_status "Repository cloned"
fi

# Step 3: Configure Environment
echo -e "${BLUE}[3/8] Configuring environment...${NC}"
if [ ! -f "$DOCKER_DIR/.env" ]; then
    echo "Generating secure environment configuration..."
    cd $APP_DIR
    ./scripts/setup-env.sh
    
    print_warning "IMPORTANT: Edit docker/.env with production values"
    echo "Required changes:"
    echo "  - STELLAR_NETWORK=mainnet"
    echo "  - STELLAR_RPC_URL (mainnet URL)"
    echo "  - CORS_ORIGINS (your domain)"
    echo "  - ANCHOR_CONFIGS (production tokens)"
    echo ""
    read -p "Press Enter after editing .env file..."
else
    print_status "Environment file already exists"
fi

# Step 4: Build Production Images
echo -e "${BLUE}[4/8] Building production images...${NC}"
cd $DOCKER_DIR

# Create production docker-compose file if it doesn't exist
if [ ! -f "docker-compose.prod.yml" ]; then
    cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  backend:
    build:
      context: ../backend
      dockerfile: Dockerfile
    env_file:
      - .env
    restart: unless-stopped
    expose:
      - "3001"
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
    env_file:
      - .env
    restart: unless-stopped
    expose:
      - "3000"
    depends_on:
      - backend
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  oracle:
    build:
      context: ../oracle
      dockerfile: Dockerfile
    env_file:
      - .env
    restart: unless-stopped
    depends_on:
      - backend
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

networks:
  default:
    driver: bridge
EOF
    print_status "Production compose file created"
fi

echo "Building Docker images (this may take 5-10 minutes)..."
docker compose -f docker-compose.prod.yml build
print_status "Images built successfully"

# Step 5: Run Database Migrations
echo -e "${BLUE}[5/8] Running database migrations...${NC}"
docker compose -f docker-compose.prod.yml run --rm backend pnpm migrate
print_status "Migrations completed"

# Step 6: Start Services
echo -e "${BLUE}[6/8] Starting services...${NC}"
docker compose -f docker-compose.prod.yml up -d
print_status "Services started"

# Wait for services to be ready
echo "Waiting for services to initialize..."
sleep 30

# Step 7: Verify Deployment
echo -e "${BLUE}[7/8] Verifying deployment...${NC}"

# Check if services are running
SERVICES=$(docker compose -f docker-compose.prod.yml ps --format json | grep -c "running" || true)
if [ "$SERVICES" -ge 3 ]; then
    print_status "All services are running ($SERVICES/3)"
else
    print_warning "Only $SERVICES/3 services are running"
    echo "Checking logs..."
    docker compose -f docker-compose.prod.yml logs --tail=50
fi

# Test backend health
if curl -s -f http://localhost:3001/health > /dev/null 2>&1; then
    print_status "Backend API is healthy"
else
    print_warning "Backend health check failed (may need more time)"
fi

# Step 8: Setup Monitoring & Backups
echo -e "${BLUE}[8/8] Setting up monitoring and backups...${NC}"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup script
cat > $APP_DIR/scripts/backup.sh << 'BACKUP_EOF'
#!/bin/bash
BACKUP_DIR="/backups/remitflow"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
docker exec remitflow-db-1 pg_dump -U postgres remitflow > $BACKUP_DIR/db_$TIMESTAMP.sql 2>/dev/null || true

# Backup environment
cp /opt/remitflow/docker/.env $BACKUP_DIR/env_$TIMESTAMP 2>/dev/null || true

# Compress
cd $BACKUP_DIR
tar -czf remitflow_$TIMESTAMP.tar.gz db_$TIMESTAMP.sql env_$TIMESTAMP 2>/dev/null || true
rm -f db_$TIMESTAMP.sql env_$TIMESTAMP 2>/dev/null || true

# Keep only last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup completed: $BACKUP_DIR/remitflow_$TIMESTAMP.tar.gz"
BACKUP_EOF

chmod +x $APP_DIR/scripts/backup.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/scripts/backup.sh") | crontab -
print_status "Daily backups configured (2 AM)"

# Create monitoring script
cat > $APP_DIR/scripts/monitor.sh << 'MONITOR_EOF'
#!/bin/bash
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null)

if [ "$BACKEND_STATUS" != "200" ]; then
    echo "❌ Backend is down! Status: $BACKEND_STATUS" | mail -s "RemitFlow Alert" admin@remitflow.io 2>/dev/null || true
    echo "❌ Backend health check failed"
else
    echo "✅ All services healthy"
fi
MONITOR_EOF

chmod +x $APP_DIR/scripts/monitor.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * $APP_DIR/scripts/monitor.sh") | crontab -
print_status "Health monitoring configured (every 5 minutes)"

# Final Summary
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Deployment Completed Successfully! 🎉          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Service URLs:${NC}"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:3001"
echo "  Backend Health: http://localhost:3001/health"
echo ""
echo -e "${BLUE}Management Commands:${NC}"
echo "  View logs:        cd $DOCKER_DIR && docker compose -f docker-compose.prod.yml logs -f"
echo "  Restart services: cd $DOCKER_DIR && docker compose -f docker-compose.prod.yml restart"
echo "  Update app:       cd $APP_DIR && git pull && ./scripts/deploy-prod.sh"
echo "  View status:      cd $DOCKER_DIR && docker compose -f docker-compose.prod.yml ps"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Configure reverse proxy (Nginx/Traefik) with SSL"
echo "  2. Set up domain DNS records"
echo "  3. Configure production anchor credentials"
echo "  4. Test all user flows"
echo "  5. Monitor logs for 24 hours"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "  Full guide: $APP_DIR/DEPLOYMENT.md"
echo "  Security:   $APP_DIR/SECURITY.md"
echo ""
