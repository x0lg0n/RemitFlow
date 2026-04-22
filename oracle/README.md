# RemitFlow Rate Oracle 🔮

**Real-time exchange rate aggregation and validation service**

[![Node.js](https://img.shields.io/badge/Runtime-Node.js%2024-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org)
[![Redis](https://img.shields.io/badge/Cache-Redis-red)](https://redis.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Overview

The RemitFlow Oracle is a **production-grade** rate aggregation service that continuously monitors and validates exchange rates from multiple Stellar anchors, ensuring users always receive the most accurate and competitive pricing.

### Key Responsibilities

- **Continuous Rate Fetching** - Poll anchor APIs every 5 minutes
- **Multi-Source Validation** - Cross-reference rates for accuracy
- **Circuit Breaker Protection** - Detect and handle anchor failures
- **Smart Contract Updates** - Publish validated rates on-chain
- **Redis Caching** - Sub-millisecond rate access
- **Historical Tracking** - Rate history for analytics

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                Oracle Service                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐    ┌──────────────┐               │
│  │   Scheduler  │───▶│ Rate Fetcher │               │
│  │  (cron job)  │    │   Engine     │               │
│  └──────────────┘    └──────┬───────┘               │
│                              │                       │
│                    ┌─────────▼─────────┐            │
│                    │  Rate Validator   │            │
│                    │ (deviation check) │            │
│                    └─────────┬─────────┘            │
│                              │                       │
│              ┌───────────────┼───────────────┐      │
│              ▼               ▼               ▼      │
│     ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│     │ PostgreSQL │  │   Redis    │  │  Soroban  │ │
│     │  (Store)   │  │  (Cache)   │  │ Contract  │ │
│     └────────────┘  └────────────┘  └───────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────┐
                │   Stellar Anchors       │
                │ (SEP-31 APIs)           │
                │ - Vibrant               │
                │ - Bantr                 │
                │ - More...               │
                └─────────────────────────┘
```

---

## Features

### 🔄 Rate Fetching
- **Parallel Anchor Polling** - Fetch from all anchors simultaneously
- **Promise.allSettled** - One anchor failure doesn't block others
- **Configurable Intervals** - Adjustable polling frequency
- **Request Timeout Handling** - Graceful timeout management

### ✅ Rate Validation
- **Deviation Detection** - Reject rates deviating >5% from median
- **Staleness Checks** - Skip rates older than 10 minutes
- **Outlier Removal** - Statistical anomaly detection
- **Multi-Source Consensus** - Validate across multiple anchors

### 🛡️ Circuit Breakers
- **Failure Detection** - Track consecutive failures per anchor
- **Automatic Pause** - Stop polling after 3 consecutive failures
- **Recovery Testing** - Periodically retry failed anchors
- **Alert Notifications** - Log failures for monitoring

### 💾 Caching Strategy
- **Redis Integration** - 5-minute TTL cache
- **Cache Warming** - Pre-populate on startup
- **Cache Invalidation** - Update on rate changes
- **Fallback Mechanism** - Serve stale cache if anchor down

### 📊 Monitoring & Logging
- **Structured Logging** - JSON format for log aggregation
- **Performance Metrics** - Fetch times, validation results
- **Error Tracking** - Detailed error context
- **Health Checks** - Service status endpoint

---

## Quick Start

### Prerequisites

```bash
✓ Node.js 24.x+
✓ pnpm 10.x+
✓ Redis 7+
✓ PostgreSQL 15+
✓ Anchor API credentials
```

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit with your configuration
nano .env
```

### Environment Variables

```env
# Server Configuration
PORT=3002
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/remitflow

# Redis
REDIS_URL=redis://localhost:6379
REDIS_TTL=300

# Stellar
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Oracle Configuration
ORACLE_SECRET=your_oracle_secret_key
ORACLE_POLLING_INTERVAL=300000
ORACLE_MAX_FAILURES=3
ORACLE_DEVIATION_THRESHOLD=0.05

# Rate Validation
RATE_MAX_STALENESS=600000
RATE_MIN_UPDATE_INTERVAL=60000

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### Start Oracle

```bash
# Development mode
pnpm dev

# Production build
pnpm build
pnpm start

# Run once (manual fetch)
pnpm run-once

# View logs
pnpm logs
```

---

## Project Structure

```
oracle/
├── src/
│   ├── fetchers/              # Anchor rate fetchers
│   │   ├── base.fetcher.ts    # Base fetcher class
│   │   ├── vibrant.fetcher.ts # Vibrant anchor
│   │   ├── bantr.fetcher.ts   # Bantr anchor
│   │   └── index.ts           # Fetcher registry
│   ├── modules/
│   │   ├── rates/             # Rate management
│   │   │   ├── rate.service.ts
│   │   │   ├── rate.validator.ts
│   │   │   └── rate.types.ts
│   │   ├── cache/             # Redis caching
│   │   │   ├── cache.service.ts
│   │   │   └── cache.keys.ts
│   │   ├── anchors/           # Anchor management
│   │   │   ├── anchor.service.ts
│   │   │   └── anchor.types.ts
│   │   └── publisher/         # Smart contract updates
│   │       ├── publisher.service.ts
│   │       └── publisher.types.ts
│   ├── shared/
│   │   ├── utils/             # Utilities
│   │   │   ├── logger.ts
│   │   │   └── helpers.ts
│   │   └── types/             # Shared types
│   │       └── oracle.types.ts
│   ├── scheduler.ts           # Cron job scheduler
│   └── index.ts               # Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Rate Fetching Flow

### 1. Scheduler Trigger

```typescript
// Every 5 minutes
scheduler.schedule('*/5 * * * *', async () => {
  await fetchAllAnchorRates();
});
```

### 2. Parallel Fetching

```typescript
const results = await Promise.allSettled(
  anchors.map(anchor => fetchAnchorRates(anchor))
);

// Process successful fetches
const successful = results
  .filter(r => r.status === 'fulfilled')
  .map(r => r.value);

// Log failures
const failed = results
  .filter(r => r.status === 'rejected')
  .forEach(r => logger.error(r.reason));
```

### 3. Validation

```typescript
const validated = rates.filter(rate => {
  // Check staleness
  if (isStale(rate.timestamp)) return false;
  
  // Check deviation from median
  const deviation = calculateDeviation(rate, median);
  if (deviation > DEVIATION_THRESHOLD) return false;
  
  return true;
});
```

### 4. Storage & Caching

```typescript
// Store in PostgreSQL
await rateService.saveRates(validated);

// Update Redis cache
await cacheService.setRates(validated, TTL);

// Publish to smart contract (if enabled)
await publisher.publishRates(validated);
```

---

## Anchor Integration

### Adding a New Anchor

#### 1. Create Fetcher

```typescript
// src/fetchers/vibrant.fetcher.ts
export class VibrantFetcher extends BaseFetcher {
  async fetchRates(anchor: Anchor): Promise<AnchorRate[]> {
    const response = await fetch(`${anchor.baseUrl}/rates`, {
      headers: {
        'Authorization': `Bearer ${anchor.authToken}`
      }
    });
    
    const data = await response.json();
    
    return data.rates.map(rate => ({
      anchorId: anchor.id,
      fromCurrency: rate.from,
      toCurrency: rate.to,
      buyRate: rate.buy,
      sellRate: rate.sell,
      feePercent: rate.fee,
      timestamp: Date.now()
    }));
  }
}
```

#### 2. Register Fetcher

```typescript
// src/fetchers/index.ts
export const fetchers = {
  vibrant: VibrantFetcher,
  bantr: BantrFetcher,
  // Add new fetchers here
};
```

#### 3. Configure Anchor

Add anchor to database via API or admin panel:

```bash
curl -X POST http://localhost:3001/anchors \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "id": "vibrant_colombia",
    "name": "Vibrant Colombia",
    "baseUrl": "https://api.vibrantapp.com",
    "authToken": "your_token",
    "fetcherType": "vibrant",
    "isActive": true
  }'
```

#### 4. Oracle Auto-Detects

Oracle automatically starts polling new anchors on next cycle.

---

## Circuit Breaker

### Failure Handling

```typescript
class CircuitBreaker {
  private failures: Map<string, number> = new Map();
  private readonly MAX_FAILURES = 3;
  
  recordFailure(anchorId: string): void {
    const count = this.failures.get(anchorId) || 0;
    this.failures.set(anchorId, count + 1);
    
    if (count + 1 >= this.MAX_FAILURES) {
      this.pauseAnchor(anchorId);
      logger.warn(`Anchor ${anchorId} paused after ${count + 1} failures`);
    }
  }
  
  recordSuccess(anchorId: string): void {
    this.failures.delete(anchorId);
  }
  
  isPaused(anchorId: string): boolean {
    return (this.failures.get(anchorId) || 0) >= this.MAX_FAILURES;
  }
}
```

### Recovery

- Oracle retries paused anchors every 30 minutes
- If successful, anchor is reactivated
- If fails again, remains paused
- Admin can manually force retry

---

## Testing

### Run Tests

```bash
# All tests
pnpm test

# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# With coverage
pnpm test:coverage
```

### Mock Anchor API

```typescript
// tests/mocks/anchor.mock.ts
export const mockAnchorResponse = {
  rates: [
    {
      from: 'USD',
      to: 'COP',
      buy: 4200.50,
      sell: 4195.25,
      fee: 1.5
    }
  ]
};
```

---

## Monitoring

### Health Check

```bash
curl http://localhost:3002/health
```

Response:

```json
{
  "status": "healthy",
  "uptime": 86400,
  "lastFetch": "2026-04-22T10:30:00Z",
  "anchorsActive": 3,
  "anchorsPaused": 1,
  "ratesInCache": 15,
  "avgFetchTimeMs": 245
}
```

### Logs

Structured JSON logs:

```json
{
  "level": "info",
  "timestamp": "2026-04-22T10:30:00Z",
  "service": "oracle",
  "action": "rates_fetched",
  "anchor": "vibrant_colombia",
  "ratesCount": 5,
  "durationMs": 234,
  "cached": true
}
```

### Metrics to Monitor

- **Fetch Success Rate** - Should be >95%
- **Average Fetch Time** - Target <500ms
- **Cache Hit Rate** - Should be >90%
- **Validation Rejection Rate** - Monitor for anomalies
- **Circuit Breaker Activations** - Alert if frequent

---

## Production Deployment

### Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production Redis and PostgreSQL
- [ ] Set strong `ORACLE_SECRET`
- [ ] Adjust polling interval for production load
- [ ] Enable structured logging
- [ ] Set up monitoring and alerting
- [ ] Configure log rotation
- [ ] Test circuit breaker functionality
- [ ] Load test with all anchors

### Docker

```bash
# Build
docker build -t remitflow-oracle .

# Run
docker run -d \
  --name remitflow-oracle \
  --env-file .env.production \
  remitflow-oracle
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: remitflow-oracle
spec:
  replicas: 1  # Single instance to avoid duplicate polling
  template:
    spec:
      containers:
      - name: oracle
        image: remitflow-oracle:latest
        envFrom:
        - secretRef:
            name: oracle-secrets
```

---

## Troubleshooting

### Oracle Not Fetching Rates

```bash
# Check logs
docker compose logs oracle

# Verify database connection
curl http://localhost:3002/health

# Check Redis
redis-cli ping

# Manual trigger
curl -X POST http://localhost:3002/fetch
```

### High Failure Rate

1. Check anchor API status
2. Verify credentials are valid
3. Check network connectivity
4. Review circuit breaker logs
5. Test anchor API manually

### Stale Rates

1. Verify polling interval is configured
2. Check scheduler is running
3. Review anchor response times
4. Check cache TTL settings

---

## Contributing

See [../CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### Development Standards

- **Code Style:** ESLint + Prettier
- **Type Safety:** Strict TypeScript
- **Testing:** Jest, 85%+ coverage
- **Logging:** Structured JSON logs
- **Error Handling:** Circuit breakers, retries

---

## Resources

- [Node.js Documentation](https://nodejs.org/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Redis Documentation](https://redis.io/docs)
- [Stellar SDK](https://stellar.github.io/js-stellar-sdk)
- [SEP-31 Specification](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0031.md)

---

## License

MIT License - see [../LICENSE](../LICENSE)
