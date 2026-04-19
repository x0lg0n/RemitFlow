# RemitFlow - Local Development Setup

Since Docker socket access is restricted in this environment, here's how to run everything locally.

---

## Quick Start (5 minutes)

### Terminal 1: Frontend
```bash
cd frontend
pnpm dev
# Runs on: http://localhost:3000
```

### Terminal 2: Backend API
```bash
cd backend
pnpm dev
# Runs on: http://localhost:3001
# NOTE: Will show connection errors for PostgreSQL/Redis, but still starts!
```

### Terminal 3: Tests (optional)
```bash
cd frontend
pnpm test

# OR backend tests
cd backend
pnpm test
```

---

## Full Setup (with Database & Cache)

### Option A: Install PostgreSQL & Redis Locally

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib redis-server

# Start services
sudo systemctl start postgresql
sudo systemctl start redis-server

# Create database
sudo -u postgres createdb remiflow

# Run migrations
sudo -u postgres psql remiflow < database/migrations/001_schema_bootstrap.sql
sudo -u postgres psql remiflow < database/migrations/002_anchor_dashboard_indexes.sql
```

**macOS (with Homebrew):**
```bash
brew install postgresql redis

# Start services
brew services start postgresql
brew services start redis

# Create database
createdb remiflow

# Run migrations
psql remiflow < database/migrations/001_schema_bootstrap.sql
psql remiflow < database/migrations/002_anchor_dashboard_indexes.sql
```

---

### Option B: Use Docker for Just DB & Redis (Optional)

If you want to use Docker just for the database and cache:

```bash
# Start only PostgreSQL and Redis
docker run -d \
  --name remiflow-postgres \
  -e POSTGRES_DB=remiflow \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

docker run -d \
  --name remiflow-redis \
  -p 6379:6379 \
  redis:7-alpine

# Run migrations
psql -h localhost -U postgres -d remiflow < database/migrations/001_schema_bootstrap.sql
psql -h localhost -U postgres -d remiflow < database/migrations/002_anchor_dashboard_indexes.sql

# Stop later:
docker stop remiflow-postgres remiflow-redis
```

---

## Services Overview

### Frontend (React + Next.js 16)
```bash
cd frontend
pnpm dev
# Port: 3000
# Features: Rate comparison UI, wallet connection, transaction history
```

### Backend API (Express + Node.js)
```bash
cd backend
pnpm dev
# Port: 3001
# Features: Rate endpoints, SEP-10 auth, transaction management
# Works without DB/Redis (with limitations)
```

### Oracle Service (Rate Fetcher)
```bash
cd oracle
pnpm dev
# Updates rates every 5 minutes
# Requires: PostgreSQL, Redis (for this to work fully)
```

### Database (PostgreSQL)
- Port: 5432
- User: postgres
- Password: postgres
- Database: remiflow

### Cache (Redis)
- Port: 6379
- Default: No password

---

## Testing Everything

### Run All Tests
```bash
# Backend
cd backend && pnpm test

# Frontend
cd frontend && pnpm test

# Oracle
cd oracle && pnpm test
```

### Health Check
```bash
curl http://localhost:3001/health
# Expected: { "status": "healthy" }
```

### View Logs
```bash
# Follow backend logs
cd backend && pnpm dev

# Follow frontend logs
cd frontend && pnpm dev

# Follow oracle logs
cd oracle && pnpm dev
```

---

## Troubleshooting

### Issue: Port Already In Use

**Solution - Kill the process:**
```bash
# Kill process on port 3000 (frontend)
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3001 (backend)
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3000 (alternative)
fuser -k 3000/tcp
```

### Issue: PostgreSQL Connection Refused

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start if stopped
sudo systemctl start postgresql

# View logs
sudo journalctl -u postgresql -n 20
```

### Issue: Redis Connection Refused

**Solution:**
```bash
# Check if Redis is running
redis-cli ping
# Expected: PONG

# Start if stopped
redis-server &

# Or with systemctl
sudo systemctl start redis-server
```

### Issue: TypeScript Errors

**Solution:**
```bash
# Rebuild TypeScript
cd backend && pnpm build
cd frontend && pnpm typecheck
```

### Issue: Missing Dependencies

**Solution:**
```bash
# Reinstall dependencies
cd frontend && pnpm install
cd backend && pnpm install
cd oracle && pnpm install
```

---

## Next Steps

✅ Frontend running on http://localhost:3000  
✅ Backend API running on http://localhost:3001  
✅ Tests passing  
⏭️ Connect Freighter wallet to frontend  
⏭️ Deploy smart contract to Stellar testnet  
⏭️ Configure anchor integrations  

---

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/remiflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-change-me-in-production
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
CORS_ORIGINS=http://localhost:3000
```

### Oracle (.env)
```
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/remiflow
REDIS_URL=redis://localhost:6379
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
POLL_INTERVAL_MINUTES=5
```

---

## Project Structure (for reference)

```
RemitFlow/
├── frontend/              # React + Next.js application
│   ├── app/              # Pages & routes
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   └── lib/              # Utilities
│
├── backend/              # Express API
│   ├── src/
│   │   ├── modules/      # Business logic
│   │   └── shared/       # Config & middleware
│
├── oracle/               # Rate oracle service
│   └── src/
│       ├── modules/      # Fetchers, validators
│
├── database/migrations/  # SQL schemas
└── docker/              # Docker configuration
```

---

## Quick Commands Reference

```bash
# Install all dependencies
pnpm install

# Start frontend
cd frontend && pnpm dev

# Start backend
cd backend && pnpm dev

# Start oracle
cd oracle && pnpm dev

# Run tests (all)
cd frontend && pnpm test
cd backend && pnpm test

# Build for production
cd frontend && pnpm build
cd backend && pnpm build

# Type check
cd frontend && pnpm typecheck
cd backend && pnpm build

# Lint code
cd frontend && pnpm lint
cd backend && pnpm lint
```

---

**Ready to go! Start with the Quick Start section above.** 🚀
