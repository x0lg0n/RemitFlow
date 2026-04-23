# Development Setup Guide

Complete guide for setting up your local development environment for RemitFlow.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Oracle Setup](#oracle-setup)
6. [Smart Contracts Setup](#smart-contracts-setup)
7. [Database Setup](#database-setup)
8. [Running the Full Stack](#running-the-full-stack)
9. [Development Workflow](#development-workflow)
10. [Debugging](#debugging)
11. [Common Issues](#common-issues)

---

## Prerequisites

### Required Software

| Software       | Version | Purpose                               | Installation Link                      |
| -------------- | ------- | ------------------------------------- | -------------------------------------- |
| Node.js        | 24.x+   | Runtime for backend, frontend, oracle | [nodejs.org](https://nodejs.org)       |
| pnpm           | 10.x+   | Package manager                       | [pnpm.io](https://pnpm.io)             |
| Docker         | 24.x+   | Containerization                      | [docker.com](https://docker.com)       |
| Docker Compose | 2.x+    | Multi-container orchestration         | Included with Docker                   |
| PostgreSQL     | 15      | Database (via Docker)                 | Included in docker-compose             |
| Redis          | 7       | Caching (via Docker)                  | Included in docker-compose             |
| Rust           | 1.75+   | Smart contract development            | [rust-lang.org](https://rust-lang.org) |
| Git            | 2.x+    | Version control                       | [git-scm.com](https://git-scm.com)     |

### Optional Software

| Software         | Purpose                    | Installation Link                                      |
| ---------------- | -------------------------- | ------------------------------------------------------ |
| Freighter Wallet | Stellar wallet for testing | [freighter.app](https://freighter.app)                 |
| VS Code          | Code editor                | [code.visualstudio.com](https://code.visualstudio.com) |
| Postman          | API testing                | [postman.com](https://postman.com)                     |
| pgAdmin          | Database GUI               | [pgadmin.org](https://pgadmin.org)                     |

### Verify Installation

```bash
# Check Node.js
node --version  # Should be v24.x or higher

# Check pnpm
pnpm --version  # Should be v10.x or higher

# Check Docker
docker --version  # Should be v24.x or higher

# Check Rust
rustc --version  # Should be v1.75 or higher

# Check Git
git --version
```

---

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/x0lg0n/remitflow.git
cd remitflow
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install

# Install oracle dependencies
cd ../oracle
pnpm install
```

### 3. Configure Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env

# Oracle
cp oracle/.env.example oracle/.env

# Docker
cp docker/.env.example docker/.env
```

**Important:** Edit each `.env` file and fill in required values. See environment variable documentation below.

---

## Backend Setup

### Environment Variables (backend/.env)

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/remitflow

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRY_HOURS=24

# Stellar
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
SOROBAN_CONTRACT_ADDRESS=CDLZFC3TMJYR2HV5YVNP7XQKGD3KQVLR4XQZ6QXQZ6QXQZ6QXQZ6QX

# SEP-10
SEP10_HOME_DOMAIN=localhost:3001
SEP10_WEB_AUTH_DOMAIN=localhost:3001
SEP10_SERVER_SECRET=SABC...YOUR_STELLAR_SECRET_KEY

# CORS
CORS_ORIGINS=http://localhost:3000
```

### Run Backend

```bash
cd backend

# Development mode (with hot reload)
pnpm dev

# Build
pnpm build

# Start production build
pnpm start

# Run tests
pnpm test

# Run linter
pnpm lint
```

**Verify:** Visit http://localhost:3001/health

---

## Frontend Setup

### Environment Variables (frontend/.env)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Stellar
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_FREIGHTER_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

### Run Frontend

```bash
cd frontend

# Development mode (with hot reload)
pnpm dev

# Build
pnpm build

# Start production build
pnpm start

# Run tests
pnpm test

# Run linter
pnpm lint
```

**Verify:** Visit http://localhost:3000

---

## Oracle Setup

### Environment Variables (oracle/.env)

```env
# Server
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/remitflow

# Redis
REDIS_URL=redis://localhost:6379

# Soroban
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
SOROBAN_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
SOROBAN_CONTRACT_ADDRESS=CDLZFC3TMJYR2HV5YVNP7XQKGD3KQVLR4XQZ6QXQZ6QXQZ6QXQZ6QX

# Oracle
ORACLE_SECRET_KEY=SABC...YOUR_ORACLE_SECRET_KEY
ORACLE_USE_RATE_CALLBACK_ONLY=true

# Polling
POLL_INTERVAL_MINUTES=5
MAX_DEVIATION_PERCENT=5
MAX_CONSECUTIVE_FAILURES=3

# Anchor Configs (JSON array)
ANCHOR_CONFIGS=[{"id":"vibrant","url":"https://api.vibrant.co","token":"your-token"}]
```

### Run Oracle

```bash
cd oracle

# Start oracle service
pnpm dev

# Run tests
pnpm test

# Run linter
pnpm lint
```

---

## Smart Contracts Setup

### Install Rust Toolchain

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install Soroban CLI
cargo install --locked soroban-cli
```

### Build Contract

```bash
cd smart-contracts/contracts/remitflow

# Build WASM contract
cargo build --target wasm32-unknown-unknown --release

# Run tests
cargo test --release

# Format code
cargo fmt

# Run clippy (linter)
cargo clippy -- -D warnings
```

### Deploy to Testnet

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/remitflow.wasm \
  --source <YOUR_WALLET_ALIAS> \
  --network testnet
```

---

## Database Setup

### Using Docker (Recommended)

```bash
# Start PostgreSQL via Docker
cd docker
docker compose up -d db

# Database will be available at:
# Host: localhost
# Port: 5432
# Database: remitflow
# User: postgres
# Password: postgres (from docker/.env)
```

Migrations run automatically on first startup from `database/migrations/`.

### Manual Setup (Without Docker)

```bash
# Install PostgreSQL locally
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql@15

# Start PostgreSQL service
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS

# Create database
createdb remitflow

# Run migrations manually
psql -d remitflow -f database/migrations/001_schema_bootstrap.sql
psql -d remitflow -f database/migrations/002_anchor_dashboard_indexes.sql
psql -d remitflow -f database/migrations/003_sep31_callbacks.sql
```

### Verify Database

```bash
# Connect to database
psql -h localhost -U postgres -d remitflow

# Check tables
\dt

# View anchors table
SELECT * FROM anchors;

# Exit
\q
```

---

## Running the Full Stack

### Option 1: Docker Compose (Easiest)

```bash
cd docker

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f oracle
docker compose logs -f frontend

# Stop all services
docker compose down

# Stop and remove volumes (resets database)
docker compose down -v
```

**Services:**

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Option 2: Manual (For Development)

```bash
# Terminal 1: Start infrastructure
cd docker
docker compose up -d db redis

# Terminal 2: Start backend
cd backend
pnpm dev

# Terminal 3: Start oracle
cd oracle
pnpm dev

# Terminal 4: Start frontend
cd frontend
pnpm dev
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow coding standards in [AGENTS.md](../AGENTS.md):

- TypeScript: No `any`, strict mode
- Rust: `#![no_std]`, typed errors
- Tests: Meet coverage thresholds
- Commits: Conventional commits format

### 3. Run Tests

```bash
# Backend
cd backend && pnpm test

# Frontend
cd frontend && pnpm test

# Oracle
cd oracle && pnpm test

# Smart Contracts
cd smart-contracts && cargo test --release
```

### 4. Lint Code

```bash
# TypeScript projects
pnpm lint

# Rust project
cargo clippy -- -D warnings
cargo fmt
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to GitHub repository
2. Click "Compare & pull request"
3. Fill out PR template
4. Request review from maintainers
5. Wait for CI checks to pass

---

## Debugging

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/dist/index.js",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "sourceMaps": true
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Oracle",
      "program": "${workspaceFolder}/oracle/dist/index.js",
      "outFiles": ["${workspaceFolder}/oracle/dist/**/*.js"],
      "sourceMaps": true
    }
  ]
}
```

### Backend Debugging

```bash
# Run with debug logging
NODE_ENV=development DEBUG=* pnpm dev

# Inspect Node process
node --inspect dist/index.js
```

### Frontend Debugging

- Open browser DevTools (F12)
- Check Console for errors
- Use React DevTools extension
- Check Network tab for API calls

### Database Debugging

```bash
# View slow queries
docker compose exec db psql -U postgres -d remitflow -c "SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;"

# View connection stats
docker compose exec db psql -U postgres -d remitflow -c "SELECT count(*) FROM pg_stat_activity;"
```

### Smart Contract Debugging

```bash
# Run tests with verbose output
cargo test --release -- --nocapture

# Use Soroban CLI for manual testing
soroban contract invoke \
  --id <CONTRACT_ADDRESS> \
  --source <WALLET> \
  --network testnet \
  -- \
  get_anchor_rate \
  --anchor_id vibrant
```

---

## Common Issues

### Issue: Port Already in Use

```bash
# Find process using port
lsof -i :3001  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Kill process
kill -9 <PID>
```

### Issue: Database Connection Failed

```bash
# Check if PostgreSQL is running
docker compose ps db

# Restart PostgreSQL
docker compose restart db

# Check logs
docker compose logs db
```

### Issue: TypeScript Errors

```bash
# Clean and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm store prune
pnpm install

# Regenerate types
pnpm tsc --noEmit
```

### Issue: Docker Build Fails

```bash
# Clean Docker
docker system prune -f
docker compose build --no-cache

# Check disk space
df -h
docker system df
```

### Issue: Smart Contract Tests Fail

```bash
# Update Rust toolchain
rustup update

# Clean build
cargo clean
cargo build --target wasm32-unknown-unknown --release
cargo test --release
```

---

## Additional Resources

- **[AGENTS.md](../AGENTS.md)** - Coding standards and guidelines
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - System architecture
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common problems and solutions
- **[API Documentation](./API.md)** - Backend API reference

---

**Last Updated:** April 2026  
**Maintained By:** RemitFlow Team
