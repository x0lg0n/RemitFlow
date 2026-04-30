# Deploy RemitFlow on Render

**Frontend:** Vercel ✓  
**Backend, Oracle, Database:** Render (Free Tier)

---

## 📋 Render Free Tier Limitations

⚠️ **Important:**
- Web Services: Free but spin down after 15 min inactivity
- PostgreSQL: NOT free (managed PostgreSQL starts at $7/month)
- Redis: NOT free (managed Redis starts at $7/month)
- Bandwidth: 100GB/month included

**Workarounds for Free Tier:**
- Use PostgreSQL on Neon (free tier available)
- Use Upstash Redis (free tier: 10,000 commands/day)
- Or use Render's paid databases ($7-15/month each)

---

## 🎯 Deployment Strategy

### Option A: All Free (Recommended for MVP)
- **Frontend:** Vercel (free)
- **Backend:** Render Web Service (free, spins down after 15 min)
- **Oracle:** Render Web Service (free, spins down after 15 min)
- **PostgreSQL:** Neon (free tier)
- **Redis:** Upstash (free tier)

### Option B: Production Ready (Paid)
- **Frontend:** Vercel Pro ($20/month) or free
- **Backend:** Render Web Service ($7+/month)
- **Oracle:** Render Web Service ($7+/month)
- **PostgreSQL:** Render ($7+/month)
- **Redis:** Render ($7+/month)

We'll use **Option A** for this guide.

---

## 🚀 Step 1: Prepare Repository

### Add render.yaml to Root
This configures all services for one-click deployment.

Create: `/home/x0lg0n/x0lg0n/RISEIN /RemitFlow/render.yaml`

```yaml
services:
  # Backend API
  - type: web
    name: remitflow-backend
    runtime: node
    region: oregon
    plan: free
    buildCommand: cd backend && corepack enable && pnpm install && pnpm build
    startCommand: cd backend && node dist/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: DATABASE_URL
        fromDatabase:
          name: remitflow-db
          property: connectionString
      - key: REDIS_URL
        value: ${UPSTASH_REDIS_URL}
      - key: JWT_SECRET
        generateValue: true
      - key: STELLAR_RPC_URL
        value: https://soroban-testnet.stellar.org
      - key: STELLAR_NETWORK_PASSPHRASE
        value: Test SDF Network ; September 2015
      - key: CONTRACT_ADDRESS
        value: # Set after contract deployment

  # Oracle Service
  - type: web
    name: remitflow-oracle
    runtime: node
    region: oregon
    plan: free
    buildCommand: cd oracle && corepack enable && pnpm install && pnpm build
    startCommand: cd oracle && node dist/scheduler.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: remitflow-db
          property: connectionString
      - key: REDIS_URL
        value: ${UPSTASH_REDIS_URL}
      - key: ORACLE_SECRET_KEY
        value: # Set from Stellar account secret key
      - key: STELLAR_RPC_URL
        value: https://soroban-testnet.stellar.org
      - key: CONTRACT_ADDRESS
        value: # Set after contract deployment

  # PostgreSQL Database (using Neon free tier)
  # Note: Create separately on Neon, then reference in envVars above

# Cron jobs for Oracle
jobs:
  - type: cron
    name: oracle-scheduler
    runtime: node
    schedule: "*/10 * * * *"  # Every 10 minutes
    buildCommand: cd oracle && pnpm install
    startCommand: cd oracle && node dist/scheduler.js
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: remitflow-db
          property: connectionString
      - key: REDIS_URL
        value: ${UPSTASH_REDIS_URL}
```

**Note:** The `render.yaml` approach is premium. For free tier, we'll deploy manually (see Step 2).

---

## 🔑 Step 2: Set Up External Services (Free Tier)

### 2A: PostgreSQL on Neon (Free)

1. **Create Neon Account**
   - Go to: https://neon.tech
   - Sign up with GitHub
   - Create new project: "remitflow"

2. **Create Database**
   - Project: remitflow
   - Database: remitflow_db
   - Copy connection string (looks like):
     ```
     postgresql://user:password@ep-xxx.us-east-1.neon.tech/remitflow_db
     ```

3. **Run Migrations**
   - Download psql client or use Neon's SQL editor
   - Run each migration file in order:
     ```sql
     -- From /home/x0lg0n/x0lg0n/RISEIN /RemitFlow/database/migrations/
     \i 001_schema_bootstrap.sql
     \i 002_anchor_dashboard_indexes.sql
     \i 003_sep31_callbacks.sql
     \i 004_sep31_execution_tracking.sql
     \i 999_seed_demo_anchors.sql
     ```

### 2B: Redis on Upstash (Free)

1. **Create Upstash Account**
   - Go to: https://upstash.com
   - Sign up
   - Create new Redis database (free tier)

2. **Copy Connection String**
   ```
   redis://default:password@host:port
   ```

---

## 🚀 Step 3: Deploy Backend on Render

### 3A: Create Render Account
- Go to: https://render.com
- Sign up with GitHub
- Connect your GitHub account

### 3B: Create Backend Web Service

1. **Dashboard → New → Web Service**

2. **Connect Repository**
   - Select your RemitFlow repository
   - Branch: main

3. **Configure Service**
   - **Name:** remitflow-backend
   - **Region:** Oregon (closest to US)
   - **Runtime:** Node
   - **Build Command:**
     ```bash
     cd backend && corepack enable && pnpm install && pnpm build
     ```
   - **Start Command:**
     ```bash
     cd backend && node dist/index.js
     ```
   - **Plan:** Free

4. **Environment Variables**
   - Click "Advanced → Environment"
   - Add all variables:

     ```
     NODE_ENV=production
     PORT=3000
     DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/remitflow_db
     REDIS_URL=redis://default:password@host:port
     JWT_SECRET=generate-random-secret-key-here
     STELLAR_RPC_URL=https://soroban-testnet.stellar.org
     STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
     CONTRACT_ADDRESS=C123...456  # After deploying contract
     CALLBACK_WEBHOOK_URL=https://remitflow-backend.onrender.com/callbacks
     CORS_ORIGIN=https://remitflow.vercel.app
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build (~3-5 min)
   - Check logs for errors

### 3C: Verify Backend is Running

```bash
# Get your Render backend URL (e.g., https://remitflow-backend.onrender.com)
curl https://remitflow-backend.onrender.com/health

# Expected response:
# { "status": "ok", "timestamp": "2026-04-25T..." }
```

---

## 🚀 Step 4: Deploy Oracle on Render

### 4A: Create Oracle Web Service

1. **Dashboard → New → Web Service**

2. **Connect Repository**
   - Same RemitFlow repository
   - Branch: main

3. **Configure Service**
   - **Name:** remitflow-oracle
   - **Region:** Oregon
   - **Runtime:** Node
   - **Build Command:**
     ```bash
     cd oracle && corepack enable && pnpm install && pnpm build
     ```
   - **Start Command:**
     ```bash
     cd oracle && node dist/scheduler.js
     ```
   - **Plan:** Free

4. **Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/remitflow_db
   REDIS_URL=redis://default:password@host:port
   ORACLE_SECRET_KEY=SAAAAAAA...  # Your Stellar account secret
   STELLAR_RPC_URL=https://soroban-testnet.stellar.org
   CONTRACT_ADDRESS=C123...456  # Must match backend
   LOG_LEVEL=info
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build

### 4B: Verify Oracle is Running

Check Render logs:
- Go to remitflow-oracle service
- Click "Logs"
- Should see: "Oracle scheduler started"

---

## 🌍 Step 5: Connect Frontend to Backend

Update frontend environment variables on Vercel:

```
NEXT_PUBLIC_API_URL=https://remitflow-backend.onrender.com
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
```

---

## 🔧 Step 6: Deploy Smart Contract

Contract stays on testnet (deployed separately via CLI):

```bash
cd smart-contracts
soroban contract deploy \
  --wasm target/wasm32v1-none/release/remiflow.wasm \
  --network testnet \
  --source-account CREATOR_ACCOUNT

# Returns CONTRACT_ID, save it
export CONTRACT_ADDRESS=C...
```

Then update both Backend and Oracle env vars on Render:
- Go to Backend service → Environment
- Update: `CONTRACT_ADDRESS=C...`
- Click "Save"
- Service auto-redeploys

---

## ⚠️ Important: Free Tier Inactivity Spin Down

Since you're using free tier, services spin down after 15 minutes of inactivity.

**Solution: Add Uptime Monitor**

1. **Use Render's built-in monitoring** or external service
2. **Add a cron job** that pings the API every 14 minutes

```bash
# Add to your crontab (on any server)
*/14 * * * * curl https://remitflow-backend.onrender.com/health
```

Or use a free service like **UptimeRobot**:
- Go to: https://uptimerobot.com
- Create new monitor
- URL: https://remitflow-backend.onrender.com/health
- Interval: 10 minutes

---

## 📊 Environment Variable Summary

**Backend (.env)**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pwd@ep-xxx.neon.tech/db
REDIS_URL=redis://default:pwd@host:port
JWT_SECRET=your-secret-here
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
CONTRACT_ADDRESS=C...  # After deploying contract
CORS_ORIGIN=https://remitflow.vercel.app
```

**Oracle (.env)**
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pwd@ep-xxx.neon.tech/db
REDIS_URL=redis://default:pwd@host:port
ORACLE_SECRET_KEY=SAAAA...  # Stellar secret
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
CONTRACT_ADDRESS=C...  # Must match backend
```

**Frontend (Vercel)**
```
NEXT_PUBLIC_API_URL=https://remitflow-backend.onrender.com
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
```

---

## ✅ Post-Deployment Verification

### Check All Services

```bash
# 1. Backend health
curl https://remitflow-backend.onrender.com/health

# 2. Test API endpoint
curl https://remitflow-backend.onrender.com/rates/best \
  -H "Content-Type: application/json" \
  -d '{"from":"USDC","to":"COP","amount":1000}'

# 3. Check database connection
# Neon: https://console.neon.tech (check your DB)

# 4. Check Redis connection
# Upstash: https://console.upstash.com (check your DB)

# 5. Frontend
# Open: https://remitflow.vercel.app
# Should connect to backend successfully
```

### Monitor Logs

**Backend logs:**
```
Render Dashboard → remitflow-backend → Logs
```

**Oracle logs:**
```
Render Dashboard → remitflow-oracle → Logs
```

Look for:
- ✅ Server started on port 3000
- ✅ Database connection successful
- ✅ Redis connection successful
- ✅ No auth errors

---

## 🚨 Troubleshooting

### Backend won't start
```
Error: ENOENT: no such file or directory
```
**Fix:** Build command should be `cd backend && pnpm install && pnpm build`

### Database connection fails
```
Error: connect ECONNREFUSED
```
**Fix:**
1. Check DATABASE_URL is correct
2. Neon firewall: Allow all IPs (it's free tier, should be default)
3. Test connection: `psql $DATABASE_URL`

### Redis connection fails
```
Error: ECONNREFUSED 127.0.0.1:6379
```
**Fix:**
1. Check REDIS_URL is correct
2. Verify Upstash connection string format
3. Test: `redis-cli -u $REDIS_URL PING`

### Oracle not updating rates
```
No rates published to contract
```
**Fix:**
1. Check ORACLE_SECRET_KEY is valid
2. Verify CONTRACT_ADDRESS is correct
3. Check logs: `Render Dashboard → remitflow-oracle → Logs`

### Frontend can't reach backend
```
CORS error or 404
```
**Fix:**
1. Backend running? Check: `curl https://remitflow-backend.onrender.com/health`
2. NEXT_PUBLIC_API_URL correct? Check Vercel env vars
3. Backend CORS_ORIGIN matches frontend URL

---

## 💰 Cost Estimate (Free vs Paid)

| Component | Free | Paid |
|-----------|------|------|
| Backend | Render free | $7+/month |
| Oracle | Render free | $7+/month |
| PostgreSQL | Neon free | Neon $5+ or Render $7+ |
| Redis | Upstash free | Upstash $7+ or Render $7+ |
| Frontend | Vercel free | Vercel free |
| **Total** | **$0/month** | **$30-40/month** |

---

## 📈 Scaling to Production

When ready for mainnet:

1. **Upgrade Render plans** ($7-50/month per service)
2. **Use managed databases** (Render or other)
3. **Enable auto-scaling** (pay-per-use)
4. **Add monitoring** (Sentry, DataDog, etc.)
5. **Contract audit** (required for mainnet)
6. **SSL certificates** (automatic on Render)

See [RELEASE.md](./RELEASE.md) for production checklist.

---

## 🔗 Quick Links

- **Render:** https://render.com
- **Neon PostgreSQL:** https://neon.tech
- **Upstash Redis:** https://upstash.com
- **UptimeRobot:** https://uptimerobot.com
- **Frontend on Vercel:** https://vercel.com

---

**Deployment Date:** 2026-04-25  
**Status:** Ready for testnet free deployment
