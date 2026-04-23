# Troubleshooting Guide

Common issues and their solutions for RemitFlow.

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Docker Issues](#docker-issues)
3. [Database Issues](#database-issues)
4. [Backend Issues](#backend-issues)
5. [Frontend Issues](#frontend-issues)
6. [Oracle Issues](#oracle-issues)
7. [Smart Contract Issues](#smart-contract-issues)
8. [Authentication Issues](#authentication-issues)
9. [Performance Issues](#performance-issues)
10. [Deployment Issues](#deployment-issues)

---

## Installation Issues

### Problem: pnpm install fails

**Symptoms:**

```
ERR_PNPM_FETCH_404  GET https://registry.npmjs.org/package: Not Found
```

**Solutions:**

1. **Clear pnpm cache:**

```bash
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

2. **Check Node.js version:**

```bash
node --version  # Must be 24.x or higher
```

3. **Use correct Node.js version with nvm:**

```bash
nvm install 24
nvm use 24
pnpm install
```

---

### Problem: Rust installation fails

**Symptoms:**

```
error: could not download rustup
```

**Solutions:**

1. **Install from official source:**

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

2. **Install WASM target:**

```bash
rustup target add wasm32-unknown-unknown
```

3. **Verify installation:**

```bash
rustc --version
cargo --version
```

---

## Docker Issues

### Problem: Docker compose fails to start

**Symptoms:**

```
ERROR: for backend  Cannot start service backend: driver failed programming external connectivity
```

**Solutions:**

1. **Check if ports are already in use:**

```bash
lsof -i :3001  # Backend port
lsof -i :5432  # PostgreSQL port
lsof -i :6379  # Redis port
```

2. **Kill processes using ports:**

```bash
kill -9 <PID>
```

3. **Clean Docker and restart:**

```bash
docker compose down -v
docker system prune -f
docker compose up -d
```

4. **Check Docker daemon:**

```bash
systemctl status docker  # Linux
docker ps  # Should show running containers
```

---

### Problem: Container keeps restarting

**Symptoms:**

```
docker compose ps shows "Restarting" status
```

**Solutions:**

1. **Check container logs:**

```bash
docker compose logs backend
docker compose logs oracle
```

2. **Verify environment variables:**

```bash
cat docker/.env
# Ensure all required variables are set
```

3. **Check database connectivity:**

```bash
docker compose exec backend wget --spider -q http://localhost:3001/health
```

---

## Database Issues

### Problem: PostgreSQL connection refused

**Symptoms:**

```
error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

1. **Check if PostgreSQL is running:**

```bash
docker compose ps db
# Should show "healthy" status
```

2. **Restart PostgreSQL:**

```bash
docker compose restart db
```

3. **Check database logs:**

```bash
docker compose logs db
```

4. **Verify connection string:**

```bash
echo $DATABASE_URL
# Should be: postgresql://postgres:postgres@localhost:5432/remitflow
```

5. **Test connection manually:**

```bash
psql -h localhost -U postgres -d remitflow
```

---

### Problem: Migration fails

**Symptoms:**

```
ERROR: relation "anchors" already exists
```

**Solutions:**

1. **Reset database:**

```bash
docker compose down -v db
docker compose up -d db
# Migrations will run automatically
```

2. **Run migrations manually:**

```bash
cd database/migrations
for file in *.sql; do
  PGPASSWORD=postgres psql -h localhost -U postgres -d remitflow -f "$file"
done
```

3. **Check migration order:**

```bash
ls -la database/migrations/
# Files should be numbered: 001_, 002_, 003_, etc.
```

---

## Backend Issues

### Problem: Backend won't start

**Symptoms:**

```
Error: Cannot find module '../dist/index.js'
```

**Solutions:**

1. **Build backend:**

```bash
cd backend
pnpm build
```

2. **Check for TypeScript errors:**

```bash
pnpm tsc --noEmit
```

3. **Verify dependencies:**

```bash
pnpm install
```

4. **Run in development mode:**

```bash
pnpm dev  # Uses ts-node, no build required
```

---

### Problem: API returns 500 Internal Server Error

**Symptoms:**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Something went wrong"
  }
}
```

**Solutions:**

1. **Check backend logs:**

```bash
docker compose logs backend
# or
pnpm dev  # Watch logs in terminal
```

2. **Verify database connection:**

```bash
curl http://localhost:3001/health
```

3. **Check environment variables:**

```bash
cat backend/.env
# Ensure DATABASE_URL and REDIS_URL are correct
```

4. **Enable debug logging:**

```bash
NODE_ENV=development DEBUG=* pnpm dev
```

---

## Frontend Issues

### Problem: Next.js build fails

**Symptoms:**

```
Error occurred prerendering page "/"
```

**Solutions:**

1. **Check for TypeScript errors:**

```bash
cd frontend
pnpm tsc --noEmit
```

2. **Clear Next.js cache:**

```bash
rm -rf .next
pnpm build
```

3. **Verify environment variables:**

```bash
cat frontend/.env
# Ensure NEXT_PUBLIC_API_URL is set
```

4. **Check API connectivity:**

```bash
curl http://localhost:3001/health
# Backend must be running
```

---

### Problem: Wallet connection fails

**Symptoms:**

- Freighter wallet doesn't connect
- "Wallet not detected" error

**Solutions:**

1. **Install Freighter extension:**
   - Chrome: [Freighter](https://chrome.google.com/webstore/detail/freighter)
   - Enable in browser extensions

2. **Connect to testnet:**
   - Open Freighter settings
   - Select "Test Net" network
   - Add test account or create new one

3. **Check browser console:**

```javascript
// Should return true
await window.freighter.isConnected();
```

4. **Verify Freighter API:**

```bash
cd frontend
cat package.json | grep freighter
# Should show @stellar/freighter-api
```

---

## Oracle Issues

### Problem: Oracle not fetching rates

**Symptoms:**

- Rates not updating
- Oracle logs show errors

**Solutions:**

1. **Check oracle logs:**

```bash
docker compose logs oracle
```

2. **Verify anchor configs:**

```bash
echo $ANCHOR_CONFIGS
# Should be valid JSON array
```

3. **Test anchor API manually:**

```bash
curl https://api.vibrant.co/fee?amount=100&asset_in=USD&asset_out=COP
# Should return fee data
```

4. **Check Soroban connection:**

```bash
echo $SOROBAN_RPC_URL
# Should be valid RPC URL
```

5. **Restart oracle:**

```bash
docker compose restart oracle
```

---

### Problem: Circuit breaker triggered

**Symptoms:**

```
WARN: Circuit breaker triggered for anchor vibrant
```

**Solutions:**

1. **Check anchor status:**

```bash
curl https://api.vibrant.co/info
# Anchor API must be responding
```

2. **Wait for automatic recovery:**
   - Circuit breaker resets after timeout
   - Default: 5 minutes

3. **Manual reset (if needed):**

```bash
docker compose restart oracle
```

---

## Smart Contract Issues

### Problem: Contract deployment fails

**Symptoms:**

```
error: contract deployment failed
```

**Solutions:**

1. **Check Soroban CLI version:**

```bash
soroban --version
# Should be latest
```

2. **Verify wallet has testnet funds:**

```bash
soroban lab token address \
  --source <YOUR_WALLET> \
  --network testnet
```

3. **Get testnet XLM from friendbot:**

```bash
curl "https://friendbot.stellar.org?addr=<YOUR_PUBLIC_KEY>"
```

4. **Check contract size:**

```bash
ls -lh target/wasm32-unknown-unknown/release/remitflow.wasm
# Should be under 64KB
```

5. **Rebuild contract:**

```bash
cargo clean
cargo build --target wasm32-unknown-unknown --release
```

---

### Problem: Contract tests fail

**Symptoms:**

```
test test_initiate_payment_succeeds ... FAILED
```

**Solutions:**

1. **Run tests with verbose output:**

```bash
cargo test --release -- --nocapture
```

2. **Check test environment:**

```bash
cargo clean
cargo test --release
```

3. **Verify Rust version:**

```bash
rustc --version
# Should be 1.75 or higher
```

---

## Authentication Issues

### Problem: SEP-10 challenge fails

**Symptoms:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Signature verification failed"
  }
}
```

**Solutions:**

1. **Verify wallet is connected to correct network:**
   - Check Freighter network setting
   - Should match STELLAR_NETWORK in .env

2. **Check server secret:**

```bash
echo $SEP10_SERVER_SECRET
# Should be valid Stellar secret key (starts with S)
```

3. **Verify challenge format:**
   - Must follow SEP-10 specification
   - Check backend logs for challenge details

4. **Test with fresh challenge:**

```bash
curl -X POST http://localhost:3001/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "GABC..."}'
```

---

### Problem: JWT token expired

**Symptoms:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token expired"
  }
}
```

**Solutions:**

1. **Re-authenticate:**
   - Disconnect wallet
   - Reconnect to get new challenge
   - Sign and verify

2. **Increase token expiry (if needed):**

```env
JWT_EXPIRY_HOURS=24  # In backend/.env
```

---

## Performance Issues

### Problem: Slow API response times

**Symptoms:**

- Response time > 500ms
- Timeouts on rate requests

**Solutions:**

1. **Check database query performance:**

```bash
docker compose exec db psql -U postgres -d remitflow -c "SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;"
```

2. **Verify Redis is being used:**

```bash
docker compose exec redis redis-cli KEYS '*'
# Should show cached rates
```

3. **Check database indexes:**

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'rates';
```

4. **Monitor backend memory:**

```bash
docker stats backend
```

---

### Problem: High memory usage

**Symptoms:**

- Container memory > 1GB
- OOM killer terminates processes

**Solutions:**

1. **Check for memory leaks:**

```bash
docker stats
# Monitor memory over time
```

2. **Increase Docker memory limit:**

```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
```

3. **Optimize database queries:**
   - Use pagination
   - Add indexes
   - Avoid N+1 queries

---

## Deployment Issues

### Problem: Production deployment fails

**Symptoms:**

- Build succeeds but runtime fails
- Environment variables not loading

**Solutions:**

1. **Verify all environment variables:**

```bash
cat .env
# Compare with .env.example
```

2. **Check production build:**

```bash
NODE_ENV=production pnpm build
NODE_ENV=production pnpm start
```

3. **Verify database connection:**

```bash
echo $DATABASE_URL
# Must be production database URL
```

4. **Check CORS configuration:**

```bash
echo $CORS_ORIGINS
# Must include production domain
```

5. **Review deployment logs:**

```bash
# Render.com
render logs

# Railway.app
railway logs

# Docker
docker compose logs -f
```

---

## Getting More Help

If your issue isn't covered here:

1. **Check GitHub Issues:**
   - [Existing issues](https://github.com/x0lg0n/remitflow/issues)
   - Search for similar problems

2. **Ask in Discord:**
   - [INSERT DISCORD LINK]
   - Community can help

3. **Create a new issue:**
   - Use bug report template
   - Include logs and reproduction steps

4. **Read documentation:**
   - [ARCHITECTURE.md](../ARCHITECTURE.md)
   - [API.md](./API.md)
   - [DEVELOPMENT.md](./DEVELOPMENT.md)

---

**Last Updated:** April 2026  
**Maintained By:** RemitFlow Team
