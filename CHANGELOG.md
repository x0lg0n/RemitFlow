# Changelog

All notable changes to RemitFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive ARCHITECTURE.md documentation
- CI/CD pipeline with GitHub Actions
- Automated testing workflows
- Dependabot for dependency updates
- Issue and PR templates
- CODE_OF_CONDUCT.md
- REQUIRED_FILES.md checklist

### Changed

### Deprecated

### Removed

- `anchor-platform/` directory (not required for core functionality)

### Fixed

### Security

---

## [1.0.0] - 2026-04-23

### Added

#### Smart Contracts (Soroban)

- Anchor registration and management
- Rate storage with 24-hour TTL validation
- Route optimization (cheapest route selection)
- Payment initiation and transaction tracking
- Admin controls (pause/unpause functionality)
- Emergency pause mechanism
- Event emission for all state changes
- 92% test coverage

#### Backend API (Express.js)

- SEP-10 authentication (challenge/response)
- JWT session management (24h expiry)
- Rate comparison and route optimization endpoints
- Transaction management (initiate, track, status updates)
- Anchor management (register, validate, configure)
- SEP-31 webhook callback handling
- Rate limiting (100 req/min per IP)
- Input validation with Zod schemas
- Error handling middleware
- CORS configuration
- Helmet security headers
- PostgreSQL integration with parameterized queries
- Redis caching layer
- 85% test coverage

#### Frontend (Next.js 15)

- App Router with route groups `(auth)`, `(app)`, `(anchor)`
- Landing page with rate comparison
- Authentication flow (Freighter wallet + SEP-10)
- Dashboard with quick stats
- Send money flow with corridor selection
- Transaction history page
- Corridor browsing page
- Profile and settings pages
- Anchor dashboard for partners
- Real-time rate display
- Fee savings calculator
- Wallet connection via Freighter
- Session and wallet context providers
- Custom React hooks (useRates, useTransactions, useWallet)
- Responsive design with Tailwind CSS
- Accessibility compliance
- 75% test coverage

#### Oracle Service

- Multi-anchor rate fetching (every 5 minutes)
- Rate validation (median deviation check >5%)
- Circuit breaker (pause after 3 consecutive failures)
- Redis caching (5-minute TTL)
- Soroban contract rate publishing
- Anchor SEP-31 API integration
- Comprehensive logging
- 87% test coverage

#### Database

- PostgreSQL 15 with migrations
- Schema for anchors, transactions, rates, users
- Indexed queries for performance
- Automated migration on first startup
- Seed data for demo anchors

#### Infrastructure

- Docker Compose orchestration
- Health checks for all services
- Volume persistence for PostgreSQL and Redis
- Environment variable management
- Multi-service dependency management
- Free deployment guide (Render, Railway, Oracle Cloud)
- Production deployment guide
- Multiple deployment tiers (Free → Enterprise)

#### Documentation

- README.md with comprehensive overview
- PRD.md (Product Requirements Document)
- ROADMAP.md (18-month planning horizon)
- PROJECT_PLAN.md (week-by-week timeline)
- AGENTS.md (contributor guidelines)
- DEPLOYMENT.md (deployment instructions)
- FREE_DEPLOYMENT.md (zero-cost deployment)
- PRODUCTION_SETUP.md (production configuration)
- SECURITY.md (security best practices)
- CONTRIBUTING.md (contribution guidelines)
- ANCHOR_REGISTRATION_GUIDE.md (anchor integration)

### Security

- Non-custodial wallet authentication (Freighter)
- SEP-10 challenge/response verification
- httpOnly JWT cookies (no localStorage)
- Parameterized SQL queries (no injection)
- Content Security Policy headers
- Rate limiting on all endpoints
- Input validation at every layer
- Contract `require_auth()` on state mutations
- Oracle private key via environment variables only
- Encrypted anchor API token storage

### Performance

- Rate update latency: < 2s
- Route calculation: < 100ms
- API response time (p95): < 200ms
- Frontend load time: < 2s
- Transaction success rate: 99.5%

---

## Template for Future Releases

### [Version] - YYYY-MM-DD

#### Added

- New features

#### Changed

- Changes to existing functionality

#### Deprecated

- Soon-to-be removed features

#### Removed

- Removed features

#### Fixed

- Bug fixes

#### Security

- Security improvements

---

## Version Legend

- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: New features (backward compatible)
- **Patch (0.0.X)**: Bug fixes and minor improvements

## Links

- [GitHub Repository](https://github.com/x0lg0n/remitflow)
- [Releases](https://github.com/x0lg0n/remitflow/releases)
- [Documentation](https://docs.remitflow.io)
