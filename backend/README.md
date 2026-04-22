# RemitFlow Backend API 🔧

**Production-grade REST API for cross-border payment routing**

[![Express.js](https://img.shields.io/badge/Framework-Express.js-green)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015-blue)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Cache-Redis-red)](https://redis.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Overview

The RemitFlow backend is a **production-ready** Express.js API server that powers the cross-border payment platform with:

- **SEP-10 Authentication** - Secure wallet-based login via Stellar protocol
- **Anchor Management** - Marketplace integration and anchor onboarding
- **Rate Aggregation** - Real-time exchange rates from multiple anchors
- **Payment Routing** - Optimal corridor selection algorithms
- **Transaction Tracking** - Complete payment lifecycle management

**Base URL:** `http://localhost:3001` (development)  
**API Docs:** `http://localhost:3001/api/docs`

---

## Features

### 🔐 Authentication & Security
- SEP-10 challenge-response authentication
- JWT token management with refresh
- Role-based access control (user, anchor, admin)
- Rate limiting and CORS protection
- Input validation with Zod schemas

### 🏦 Anchor Management
- Anchor registration and activation
- Credential validation and storage
- Health monitoring and status tracking
- Marketplace integration endpoints

### 💱 Rate Services
- Real-time rate aggregation
- Corridor discovery and mapping
- Historical rate tracking
- Rate comparison algorithms

### 💸 Payment Processing
- SEP-31 payment initiation
- Transaction status tracking
- Callback handling
- Receipt generation

### 📊 Analytics & Reporting
- Transaction analytics
- Savings calculations
- Performance metrics
- Export capabilities

---

## Quick Start

### Prerequisites

```bash
✓ Node.js 24.x+
✓ pnpm 10.x+
✓ PostgreSQL 15+
✓ Redis 7+
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
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/remitflow
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379

# Stellar
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# SEP-10 Authentication
SEP10_SERVER_SECRET=your_server_secret_key_here
SEP10_HOME_DOMAIN=localhost:3000
SEP10_AUTH_TIMEOUT=900000

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=86400000

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Start Server

```bash
# Development mode (with hot reload)
pnpm dev

# Production build
pnpm build
pnpm start

# Run migrations
pnpm migrate

# Seed database (if needed)
pnpm seed
```

**API running at:** http://localhost:3001

---

## Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           # SEP-10 authentication
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.routes.ts
│   │   ├── anchors/        # Anchor management
│   │   │   ├── anchor.controller.ts
│   │   │   ├── anchor.service.ts
│   │   │   └── anchor.routes.ts
│   │   ├── rates/          # Rate aggregation
│   │   │   ├── rate.controller.ts
│   │   │   ├── rate.service.ts
│   │   │   └── rate.routes.ts
│   │   ├── payments/       # Payment processing
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   └── payment.routes.ts
│   │   └── users/          # User management
│   │       ├── user.controller.ts
│   │       ├── user.service.ts
│   │       └── user.routes.ts
│   ├── shared/
│   │   ├── middleware/     # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── types/          # TypeScript interfaces
│   │   │   ├── auth.types.ts
│   │   │   ├── anchor.types.ts
│   │   │   └── rate.types.ts
│   │   └── utils/          # Utility functions
│   │       ├── logger.ts
│   │       └── validators.ts
│   └── index.ts            # Application entry point
├── database/
│   └── migrations/         # SQL migrations
├── tests/                  # Test files
├── .env.example            # Environment template
├── package.json
└── tsconfig.json
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/auth/challenge` | Get SEP-10 challenge | ❌ |
| POST | `/auth/verify` | Verify signed challenge | ❌ |
| POST | `/auth/refresh` | Refresh JWT token | ✅ |
| POST | `/auth/logout` | Logout and revoke token | ✅ |

### Anchors

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/anchors` | List all anchors | ❌ |
| GET | `/anchors/:id` | Get anchor details | ❌ |
| POST | `/anchors` | Register new anchor | ✅ Admin |
| PUT | `/anchors/:id` | Update anchor | ✅ Admin |
| DELETE | `/anchors/:id` | Deactivate anchor | ✅ Admin |
| GET | `/anchors/:id/status` | Check anchor health | ✅ |

### Rates

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/rates` | Get all active rates | ❌ |
| GET | `/rates/best` | Find best route | ❌ |
| GET | `/rates/history` | Historical rates | ❌ |
| POST | `/rates/refresh` | Trigger rate update | ✅ Admin |

### Corridors

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/corridors` | List available corridors | ❌ |
| GET | `/corridors/:from/:to` | Get corridor rates | ❌ |

### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/initiate` | Start new payment | ✅ |
| GET | `/payments/:id` | Get payment status | ✅ |
| GET | `/payments` | User payment history | ✅ |
| POST | `/payments/:id/callback` | SEP-31 callback | ✅ Anchor |

### User Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Get current user | ✅ |
| PUT | `/users/me` | Update profile | ✅ |
| GET | `/users/me/stats` | User statistics | ✅ |

---

## Key Workflows

### 1. SEP-10 Authentication Flow

```
1. Client requests challenge: GET /auth/challenge?account=G...
2. Server generates SEP-10 challenge transaction
3. Client signs challenge with Freighter wallet
4. Client submits signed tx: POST /auth/verify
5. Server validates signature and issues JWT
6. Client uses JWT for authenticated requests
```

### 2. Rate Aggregation Flow

```
1. Oracle fetches rates from all active anchors
2. Rates stored in database with timestamps
3. Client requests rates: GET /rates
4. Server returns cached rates (Redis)
5. Rates refreshed every 5 minutes by oracle
```

### 3. Payment Routing Flow

```
1. User selects amount and currency pair
2. Client requests best route: GET /rates/best?from=USD&to=COP&amount=500
3. Server compares all active anchors
4. Returns cheapest route with fee breakdown
5. User initiates payment: POST /payments/initiate
6. Server creates SEP-31 transaction with selected anchor
```

---

## Testing

### Run Tests

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests
pnpm test:integration

# With coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### Test Coverage

```bash
pnpm test:coverage
# Opens coverage report in browser
```

**Target:** 80%+ coverage

---

## Database

### Migrations

```bash
# Run all pending migrations
pnpm migrate

# Create new migration
pnpm migrate:create add_new_column

# Rollback last migration
pnpm migrate:rollback

# Reset database (WARNING: deletes all data)
pnpm migrate:reset
```

### Schema

Key tables:
- `users` - User accounts and wallet addresses
- `anchors` - Anchor configurations and credentials
- `rates` - Exchange rates with timestamps
- `transactions` - Payment records
- `corridors` - Currency pair mappings
- `sessions` - Active user sessions

---

## Security

### Implemented Measures

✅ **SEP-10 Authentication** - Industry-standard wallet auth  
✅ **JWT Tokens** - Stateless, secure session management  
✅ **Rate Limiting** - 100 requests per 15 minutes per IP  
✅ **CORS Protection** - Whitelist-only origins  
✅ **Input Validation** - Zod schemas on all endpoints  
✅ **SQL Parameterization** - No injection vulnerabilities  
✅ **Helmet Headers** - Security headers on all responses  
✅ **Error Handling** - No stack traces in production  

### Best Practices

- Never log sensitive data (tokens, private keys)
- Always validate user input with Zod
- Use parameterized queries exclusively
- Implement proper error boundaries
- Regular dependency audits (`pnpm audit`)
- Rotate secrets periodically

---

## Monitoring

### Health Checks

```bash
# Basic health
curl http://localhost:3001/health

# Detailed health (auth required)
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/health/detailed
```

### Logging

Logs are structured in JSON format:

```json
{
  "level": "info",
  "timestamp": "2026-04-22T10:30:00Z",
  "message": "Rate update completed",
  "anchors_updated": 3,
  "duration_ms": 1250
}
```

### Metrics to Monitor

- API response times (p50, p95, p99)
- Error rates by endpoint
- Authentication success/failure rates
- Rate update frequency
- Active user sessions
- Database connection pool usage

---

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set strong JWT_SECRET and SEP10_SERVER_SECRET
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Run security audit (`pnpm audit`)
- [ ] Load test critical endpoints

### Docker Deployment

```bash
# Build image
docker build -t remitflow-backend .

# Run container
docker run -d \
  --name remitflow-backend \
  -p 3001:3001 \
  --env-file .env.production \
  remitflow-backend
```

### Kubernetes

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: remitflow-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: remitflow-backend:latest
        ports:
        - containerPort: 3001
        envFrom:
        - secretRef:
            name: backend-secrets
```

---

## Contributing

See [../CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

### Development Standards

- **Code Style:** ESLint + Prettier enforced
- **Type Safety:** Strict TypeScript, no `any`
- **Testing:** Jest, 80%+ coverage target
- **Documentation:** JSDoc for all public APIs
- **Error Handling:** Structured error responses

---

## Resources

- [Express.js Documentation](https://expressjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Redis Documentation](https://redis.io/docs)
- [SEP-10 Specification](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md)
- [SEP-31 Specification](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0031.md)
- [Stellar SDK](https://stellar.github.io/js-stellar-sdk)

---

## License

MIT License - see [../LICENSE](../LICENSE)
