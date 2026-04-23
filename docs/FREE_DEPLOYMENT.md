# 🆓 Free Deployment Guide for RemitFlow

**Deploy your production-ready RemitFlow instance with ZERO cost**

---

## 💡 Yes, You Can Deploy RemitFlow 100% FREE!

This guide shows you how to deploy RemitFlow using **free tiers** of cloud services. Perfect for:
- ✅ Testing & demos
- ✅ MVP launch
- ✅ Investor presentations
- ✅ Early user acquisition
- ✅ Proof of concept

**Limitations of Free Tier:**
- ⚠️ Limited resources (CPU, RAM, storage)
- ⚠️ May sleep after inactivity
- ⚠️ Not suitable for high traffic (>100 users/day)
- ✅ **Perfect for getting started and validating your idea!**

---

## 🎯 Free Deployment Options

### Option 1: Render.com (Recommended - Easiest)
**Best for:** Quick deployment, automatic HTTPS  
**Limits:** 750 hours/month, 512MB RAM per service  
**Setup Time:** 15 minutes

### Option 2: Railway.app
**Best for:** All-in-one platform (DB + Redis + App)  
**Limits:** $5 credit/month (enough for small app)  
**Setup Time:** 20 minutes

### Option 3: Fly.io
**Best for:** Global deployment, high performance  
**Limits:** 3 shared-CPU VMs, 3GB persistent storage  
**Setup Time:** 25 minutes

### Option 4: Oracle Cloud Free Tier (Most Generous)
**Best for:** Long-term free hosting  
**Limits:** 4 ARM cores, 24GB RAM, 200GB storage  
**Setup Time:** 45 minutes

---

## 🚀 Option 1: Render.com (15 Minutes)

### Step 1: Prepare Your Repository

```bash
# Make sure your code is on GitHub
git add .
git commit -m "Prepare for free deployment"
git push origin main
```

### Step 2: Deploy Backend API

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `remitflow-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && pnpm install && pnpm build`
   - **Start Command:** `cd backend && NODE_ENV=production node dist/index.js`
   - **Plan:** Free

5. Add Environment Variables:
```env
NODE_ENV=production
DATABASE_URL=<will add after creating DB>
REDIS_URL=<will add after creating Redis>
JWT_SECRET=<generate with: openssl rand -base64 32>
SEP10_SERVER_SECRET=<generate with: openssl rand -hex 32>
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
SOROBAN_CONTRACT_ADDRESS=CAN4U3NRPWV7IPDUSKWAYMTHWNSFH4ZRJGA7KMEDKLYJCJCCJNV6TXF7
CORS_ORIGINS=https://remitflow-backend.onrender.com
```

6. Click **"Create Web Service"**

### Step 3: Deploy Database (PostgreSQL)

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `remitflow-db`
   - **Region:** Same as backend
   - **Plan:** Free (90 days, then manual upgrade needed)

3. After creation, copy the **Internal Database URL**

4. Go back to Backend service → **Environment** → Update:
```env
DATABASE_URL=<paste PostgreSQL URL>
```

5. Redeploy backend

### Step 4: Deploy Redis (Using Upstash - Free)

1. Go to [upstash.com](https://upstash.com) and sign up (free)
2. Create Redis database (free tier: 10K commands/day)
3. Copy the Redis URL
4. Add to Backend environment:
```env
REDIS_URL=<paste Upstash Redis URL>
```

### Step 5: Deploy Frontend

1. Click **"New +"** → **"Web Service"**
2. Connect your repository
3. Configure:
   - **Name:** `remitflow-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`
   - **Plan:** Free

4. Add Environment Variables:
```env
NEXT_PUBLIC_API_URL=https://remitflow-backend.onrender.com
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

5. Click **"Create Web Service"**

### Step 6: Deploy Oracle Service

1. Click **"New +"** → **"Background Worker"** (or use cron job)
2. Configure:
   - **Name:** `remitflow-oracle`
   - **Root Directory:** `oracle`
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `node dist/index.js`
   - **Plan:** Free

3. Add same environment variables as backend

### Step 7: Test Your Deployment

```bash
# Test backend
curl https://remitflow-backend.onrender.com/health

# Test frontend
curl https://remitflow-frontend.onrender.com

# Check logs
# Render Dashboard → Services → Logs
```

**🎉 Your RemitFlow is now LIVE for FREE!**

---

## 🚂 Option 2: Railway.app (20 Minutes)

### Step 1: Sign Up

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (free $5 credit)

### Step 2: Deploy Everything

1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Select your repository
3. Railway auto-detects services

### Step 3: Add Services

In Railway dashboard:

1. **Add PostgreSQL:**
   - Click **"+"** → **"Database"** → **"Add PostgreSQL"**
   - Copy connection string

2. **Add Redis:**
   - Click **"+"** → **"Database"** → **"Add Redis"**
   - Copy connection string

3. **Configure Backend:**
   - Add environment variables (same as Render)
   - Set start command: `cd backend && node dist/index.js`

4. **Configure Frontend:**
   - Add environment variables
   - Set start command: `cd frontend && pnpm start`

5. **Configure Oracle:**
   - Add environment variables
   - Set start command: `cd oracle && node dist/index.js`

### Step 4: Deploy

Railway auto-deploys on push. Your URLs will be:
- Frontend: `https://remitflow-frontend.up.railway.app`
- Backend: `https://remitflow-backend.up.railway.app`

---

## 🪂 Option 3: Fly.io (25 Minutes)

### Step 1: Install Fly CLI

```bash
# Install
curl -L https://fly.io/install.sh | sh

# Login
fly auth signup  # or fly auth login
```

### Step 2: Deploy Backend

```bash
cd backend

# Initialize
fly launch --name remitflow-backend --no-deploy

# Set environment variables
fly secrets set \
  NODE_ENV=production \
  JWT_SECRET=$(openssl rand -base64 32) \
  SEP10_SERVER_SECRET=$(openssl rand -hex 32) \
  STELLAR_NETWORK=testnet \
  STELLAR_RPC_URL=https://soroban-testnet.stellar.org

# Deploy
fly deploy
```

### Step 3: Deploy Frontend

```bash
cd frontend

fly launch --name remitflow-frontend --no-deploy

fly secrets set \
  NEXT_PUBLIC_API_URL=https://remitflow-backend.fly.dev

fly deploy
```

### Step 4: Deploy Oracle

```bash
cd oracle

fly launch --name remitflow-oracle --no-deploy

fly deploy
```

---

## ☁️ Option 4: Oracle Cloud Free Tier (Best Long-Term)

### Step 1: Sign Up

1. Go to [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
2. Create account (requires credit card, but won't charge)
3. You get **4 ARM cores, 24GB RAM, 200GB storage FREE forever**

### Step 2: Create VM Instance

1. Go to **Compute** → **Instances** → **Create Instance**
2. Choose:
   - **Image:** Ubuntu 22.04
   - **Shape:** VM.Standard.A1.Flex (4 OCPUs, 24GB RAM)
   - **SSH Keys:** Upload your public key

3. Note the public IP

### Step 3: Setup Server

```bash
# SSH to your VM
ssh ubuntu@<your-ip>

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clone your repo
git clone https://github.com/your-org/remitflow.git
cd remitflow

# Generate secrets
./scripts/setup-env.sh

# Deploy
sudo ./scripts/deploy-prod.sh
```

### Step 4: Configure Domain & SSL

```bash
# Install Nginx
sudo apt install nginx -y

# Configure reverse proxy
sudo nano /etc/nginx/sites-available/remitflow

# Add SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**This gives you a FREE powerful server (24GB RAM!) forever!**

---

## 🆚 Free Tier Comparison

| Feature | Render | Railway | Fly.io | Oracle Cloud |
|---------|--------|---------|--------|--------------|
| **Cost** | FREE | $5 credit | FREE | FREE |
| **RAM** | 512MB/service | 1GB | 256MB/shared | **24GB** |
| **CPU** | Shared | Shared | Shared | **4 cores** |
| **Storage** | Limited | 1GB | 3GB | **200GB** |
| **Database** | 90 days | Included | Add-on | Self-hosted |
| **Sleeps** | ✅ After 15min | ❌ No | ❌ No | ❌ No |
| **Custom Domain** | ✅ | ✅ | ✅ | ✅ |
| **SSL** | ✅ Auto | ✅ Auto | ✅ Auto | Manual |
| **Best For** | Quick demo | MVP | Production | Long-term |

---

## 💰 When to Upgrade (Paid Plans)

### Upgrade When You Hit:
- 500+ daily active users
- Need 99.9% uptime SLA
- Require faster response times
- Need more database storage
- Want priority support

### Recommended Paid Setup ($50-100/mo):

| Service | Provider | Cost |
|---------|----------|------|
| Backend API | Render/Railway | $25/mo |
| Frontend | Vercel | FREE |
| Database | Supabase | $25/mo |
| Redis | Upstash | FREE (100K ops) |
| **Total** | | **~$50/mo** |

---

## 🎯 Free Deployment Checklist

### Before Deploying
- [ ] Code pushed to GitHub
- [ ] Environment variables prepared
- [ ] Domain name (optional for free tier)
- [ ] Stellar testnet contract address

### After Deploying
- [ ] Backend health check passes
- [ ] Frontend loads in browser
- [ ] Wallet connection works
- [ ] Rates are displaying
- [ ] No console errors
- [ ] HTTPS working
- [ ] Mobile responsive

---

## 📊 Free Tier Limitations & Workarounds

### Problem: Services sleep after inactivity

**Solution:** Use a free uptime monitor
```bash
# Use UptimeRobot (free)
# 1. Sign up at uptimerobot.com
# 2. Add your backend URL
# 3. Monitor every 5 minutes
# This keeps your service awake!
```

### Problem: Limited database storage

**Solution:** Use Supabase (free PostgreSQL)
```bash
# 1. Go to supabase.com
# 2. Create free project (500MB)
# 3. Get connection string
# 4. Add to your environment variables
```

### Problem: No Redis on free tier

**Solution:** Use Upstash (free Redis)
```bash
# 1. Go to upstash.com
# 2. Create free Redis (10K commands/day)
# 3. Get connection URL
# 4. Add to environment
```

---

## 🚀 Quick Start: Deploy in 15 Minutes

```bash
# 1. Fork this repository on GitHub
# 2. Go to render.com and sign up
# 3. Click "New Web Service"
# 4. Connect your repo
# 5. Add environment variables
# 6. Click Deploy
# 7. Done! 🎉
```

---

## 📚 Additional Free Resources

### Free Databases
- **Supabase:** 500MB PostgreSQL (supabase.com)
- **Neon:** 500MB PostgreSQL (neon.tech)
- **MongoDB Atlas:** 512MB (mongodb.com)

### Free Redis
- **Upstash:** 10K commands/day (upstash.com)
- **Redis Cloud:** 30MB (redis.com)

### Free Monitoring
- **UptimeRobot:** 50 monitors (uptimerobot.com)
- **Sentry:** 5K errors/month (sentry.io)
- **Logtail:** 1GB logs (logtail.com)

### Free CDNs
- **Cloudflare:** Unlimited (cloudflare.com)
- **Vercel:** Automatic (vercel.com)

---

## 🆘 Troubleshooting Free Deployments

### Backend won't start
```bash
# Check logs (Render)
Dashboard → Backend → Logs

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Build errors
```

### Frontend shows blank page
```bash
# Check browser console (F12)
# Common issues:
# - Wrong API URL
# - CORS not configured
# - Build failed
```

### Oracle not running
```bash
# Free tier limitation: background workers may not run
# Alternative: Use cron job service
# - EasyCron (free, 1 request/minute)
# - Set up to call: POST /api/oracle/fetch
```

---

## 🎓 Learning Resources

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Fly.io Documentation](https://fly.io/docs)
- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [Supabase Documentation](https://supabase.com/docs)

---

## 💡 Pro Tips for Free Deployment

1. **Use testnet first** - Stellar testnet is free
2. **Monitor uptime** - Keep services awake with UptimeRobot
3. **Optimize resources** - Minimal RAM/CPU usage
4. **Cache aggressively** - Reduce database queries
5. **Use CDNs** - Faster loading, less server load
6. **Compress assets** - Smaller bundles
7. **Lazy load** - Load features on demand
8. **Use free tiers wisely** - Combine multiple services

---

## 🎉 Summary

| Deployment Option | Time | Cost | Best For |
|-------------------|------|------|----------|
| **Render.com** | 15 min | FREE | Quick demos |
| **Railway.app** | 20 min | $5 credit | MVP launch |
| **Fly.io** | 25 min | FREE | Production |
| **Oracle Cloud** | 45 min | FREE | Long-term |

**You can deploy RemitFlow 100% FREE and start getting users immediately!**

Once you validate the idea and get traction, upgrade to paid plans for better performance.

---

**Questions?** See [QUICKSTART.md](QUICKSTART.md) or [DEPLOYMENT.md](DEPLOYMENT.md)

**Ready to deploy?** Start with [Render.com](https://render.com) - it's the easiest!
