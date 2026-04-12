# RemitFlow — Project Context

## Project Overview

**RemitFlow** is a Soroban smart contract system that aggregates multiple Stellar anchors (SEP-31) to find and automatically route cross-border remittance payments through the cheapest available path. It saves users 3–5% on remittance fees by comparing anchor fees and FX rates in real-time.

### Problem

- Remittance users lose $45B annually to high fees (3–5% average).
- No automated way to compare anchor fees and FX rates before sending.
- Anchors have underutilized SEP-31 infrastructure.

### Solution

A Soroban (Rust) smart contract + off-chain rate oracle that:

1. Aggregates routes from multiple Stellar anchors.
2. Fetches real-time fee/FX data via off-chain oracle.
3. Auto-executes payment through the optimal route.
4. Displays fee savings to users before confirmation.

### Key Differentiator

Built exclusively on Stellar's SEP-31 rails — not copyable on Ethereum or Solana due to Stellar's licensed anchor network and sub-cent transaction fees.

---

## Architecture (Planned)

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend  │────▶│   Backend/API    │────▶│ Rate Oracle  │
│  (React/TS) │     │  (Node.js/Python)│     │ (Off-chain)  │
└─────────────┘     └────────┬─────────┘     └──────┬───────┘
                             │                       │
                             ▼                       ▼
                    ┌────────────────────────────────────┐
                    │    Soroban Smart Contract (Rust)   │
                    │  Route Optimization + SEP-31 Exec  │
                    └────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │  Stellar Anchors   │
                    │ (SEP-31 / SEP-10)  │
                    └────────────────────┘
```

### Components

| Component                  | Technology        | Description                                                 |
| -------------------------- | ----------------- | ----------------------------------------------------------- |
| **Soroban Smart Contract** | Rust              | Route optimization logic, payment execution, fee splitting  |
| **Rate Oracle**            | Off-chain service | Fetches real-time anchor fees and FX rates from anchor APIs |
| **Backend/API**            | Node.js/Express   | Orchestrates oracle calls, user management, SEP-10 auth     |
| **Frontend**               | React/TypeScript  | User-facing remittance UI with route comparison             |
| **Anchor Integration**     | SEP-31 / SEP-10   | Multi-anchor cross-border payment rails                     |

---

## Technology Stack

- **Smart Contracts:** Rust on Soroban (Stellar's smart contract VM)
- **Stellar Protocols:** SEP-31 (cross-border payments), SEP-10 (authentication)
- **Off-Chain Oracle:** Node.js with cron-based rate fetching
- **Frontend:** React 18.x + TypeScript
- **Backend:** Node.js 20.x + Express
- **Database:** PostgreSQL 15.x
- **Cache:** Redis 7.x
- **Infrastructure:** AWS (EKS, RDS, ElastiCache) + Cloudflare

---

## SCF Milestone Plan

| Milestone | Deliverable                                        | Grant % |
| --------- | -------------------------------------------------- | ------- |
| **M1**    | Smart contract on testnet + 2 anchor LOIs signed   | 10%     |
| **M2**    | MVP on testnet + 100 test remittance transactions  | 20%     |
| **M3**    | Mainnet launch + 500 real remittance transactions  | 30%     |
| **M4**    | 1,000 transactions + revenue validation ($3K+ MRR) | 40%     |

**Total Budget Request:** $75,000 – $100,000 USD

---

## Revenue Model

- 1% routing fee per transaction (split with anchor partner)
- B2B SaaS for anchors: $5K/month for priority routing + analytics
- Target: $300K ARR Year 1, $1M ARR Year 3

---

## Project Structure

```
RemitFlow/
├── PRD.md                          # Product Requirements Document
├── PROJECT_PLAN.md                 # Detailed project timeline and resource plan
├── ROADMAP.md                      # Phased product roadmap (18 months)
├── DESIGN.md                       # Technical architecture and design document
├── CONTRIBUTING.md                 # Contribution guidelines
├── README.md                       # Project overview and quick start
├── QWEN.md                         # This file - project context for AI assistance
├── .github/
│   └── ISSUE_TEMPLATES/
│       ├── bug_report.md           # Bug report template
│       └── feature_request.md      # Feature request template
├── contracts/                      # Soroban smart contracts (Rust) — TO BE CREATED
├── backend/                        # Node.js API server — TO BE CREATED
├── frontend/                       # React web application — TO BE CREATED
├── oracle/                         # Rate oracle service — TO BE CREATED
├── docs/                           # Additional documentation — TO BE CREATED
└── tests/                          # Test suites — TO BE CREATED
```

---

## Key Files Reference

| File              | Purpose                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `PRD.md`          | Full product requirements: problem statement, user personas, functional/non-functional requirements, success metrics, risk register          |
| `PROJECT_PLAN.md` | Week-by-week execution plan, team structure, budget allocation, communication plan, change management                                        |
| `ROADMAP.md`      | 5-phase product roadmap from MVP to ecosystem, with revenue projections and funding timeline                                                 |
| `DESIGN.md`       | Technical architecture: smart contract code, API endpoints, oracle implementation, database schema, security design, deployment architecture |
| `CONTRIBUTING.md` | Development workflow, coding standards, testing requirements, security guidelines                                                            |
| `README.md`       | Project overview, quick start guide, documentation links                                                                                     |

---

## Development Guidelines

- **Smart contracts** written in Rust targeting Soroban.
- **SEP-31** and **SEP-10** compliance mandatory for all anchor integrations.
- **Security:** Third-party audit required before mainnet launch ($10K budgeted).
- **Oracle design:** Multi-source rate validation with circuit breakers to prevent stale/manipulated data.
- **Testing:** Testnet deployment before any mainnet activity. Target 100+ test transactions at M2.

### Coding Standards by Component

| Component      | Language           | Min Coverage | Key Standards                        |
| -------------- | ------------------ | ------------ | ------------------------------------ |
| Smart Contract | Rust               | 90%          | Soroban best practices, doc comments |
| Backend API    | Node.js/TypeScript | 80%          | ESLint + Prettier, async/await       |
| Frontend       | React/TypeScript   | 70%          | Functional components with hooks     |
| Oracle         | Node.js            | 85%          | Jest tests, error handling           |

---

## Target Users

- **Senders:** Remittance users in US, Europe sending to LatAm, Africa, Asia.
- **Recipients:** Users in Philippines, Nigeria, Colombia, Mexico.
- **Anchors:** Stellar-licensed anchors seeking more transaction volume.

### Distribution Strategy

- Partner with 2–3 existing Stellar anchors (LOIs in progress).
- 0.5% fee share incentivizes anchor referrals.
- Target: 1,000 transactions within 90 days of mainnet launch.

---

## Risk Mitigation

| Risk                | Mitigation                                         |
| ------------------- | -------------------------------------------------- |
| Anchor partnership  | Secure 2–3 anchor LOIs before mainnet              |
| Smart contract bugs | Third-party audit before mainnet launch            |
| Oracle failure      | Multi-source validation + circuit breakers         |
| Low adoption        | Anchor incentive program (fee share) drives volume |

---

## Next Steps (Development Phase)

The following directories need to be scaffolded and populated:

1. `contracts/` — Soroban smart contract (Rust) based on DESIGN.md §2
2. `backend/` — Node.js API server based on DESIGN.md §3
3. `oracle/` — Rate oracle service based on DESIGN.md §4
4. `frontend/` — React web app
5. `database/schema.sql` — PostgreSQL schema from DESIGN.md §5
6. `tests/` — Test suites for all components
