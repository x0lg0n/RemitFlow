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
| **Frontend**               | Next.js/TypeScript  | User-facing remittance UI with route comparison             |
| **Anchor Integration**     | SEP-31 / SEP-10   | Multi-anchor cross-border payment rails                     |

---

## Technology Stack

- **Smart Contracts:** Rust on Soroban (Stellar's smart contract VM)
- **Stellar Protocols:** SEP-31 (cross-border payments), SEP-10 (authentication)
- **Off-Chain Oracle:** Node.js with cron-based rate fetching
- **Frontend:** Next.js 13.x + TypeScript
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
├── AGENTS.md                       # MANDATORY — rules for contributors & AI agents
├── CONTRIBUTING.md                 # Contribution guidelines
├── README.md                       # Project overview and quick start
├── QWEN.md                         # This file - project context for AI assistance
├── LICENSE                         # MIT License
├── .gitignore
├── .github/
│   ├── ISSUE_TEMPLATES/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-contracts.yml
│       └── deploy-backend.yml
├── smart-contracts/
│   └── contracts/
│       └── remiflow/
│           ├── Cargo.toml
│           └── src/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
│       ├── config/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       ├── validators/
│       └── types/
├── oracle/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
│       ├── fetchers/
│       ├── validators/
│       ├── publisher/
│       ├── cache/
│       ├── monitoring/
│       └── types/
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── app/
│       ├── (auth)/
│       ├── (app)/
│       ├── (anchor)/
│       └── api/
├── database/
│   ├── migrations/
│   └── seeds/
├── docker/
│   └── nginx/
├── scripts/
├── docs/
└── tests/
    ├── e2e/
    ├── integration/
    ├── performance/
    └── fixtures/
```

---

## Key Files Reference

| File | Purpose |
|---|---|
| `PRD.md` | Full product requirements: problem statement, user personas, functional/non-functional requirements, success metrics, risk register |
| `PROJECT_PLAN.md` | Week-by-week execution plan, team structure, budget allocation, communication plan, change management |
| `ROADMAP.md` | 5-phase product roadmap from MVP to ecosystem, with revenue projections and funding timeline |
| `DESIGN.md` | Technical architecture: smart contract code, API endpoints, oracle implementation, database schema, security design, deployment architecture |
| `AGENTS.md` | **MANDATORY** — coding standards, security rules, testing rules, git workflow, AI agent rules |
| `CONTRIBUTING.md` | Development workflow, coding standards summary, testing requirements |
| `README.md` | Project overview, quick start guide, documentation links |

---

## MANDATORY Rules for AI Agents (READ FIRST)

### Role: Project Manager & Technical Head
AI agents operate as **Project Manager and Technical Head**. You must:
- **Own the technical quality** of every file — production-ready, industry-standard
- **Anticipate next steps** — if a feature needs a config file, create it; if a service needs a type, define it
- **Enforce standards** — reject patterns that don't match industry best practices
- **Track progress** — use todos to plan, execute, and report on multi-step tasks
- **Flag risks proactively** — if a design decision conflicts with official docs, call it out
- **Think like an architect** — consider scalability, security, maintainability, and DX in every change

### Rule #1: ALWAYS Verify Against Official Documentation Before Writing Code
**Never implement based on memory, assumptions, or outdated patterns.** Technology evolves fast — always verify.

**Verification workflow:**
1. **Identify the technology** you're working with
2. **Use `web_search`** to find the latest official documentation
3. **Use `web_fetch`** to read the relevant documentation page
4. **Cross-check** your planned implementation against the official docs
5. **If official docs differ from `DESIGN.md`** → follow the **official docs** and flag the discrepancy

**Official documentation sources to always use:**

| Component | Official Documentation |
|---|---|
| Soroban Smart Contracts | https://soroban.stellar.org/docs |
| Stellar Protocols (SEP-31, SEP-10) | https://developers.stellar.org/docs |
| Stellar SDK (js-stellar-sdk) | https://stellar.github.io/js-stellar-sdk/ |
| Freighter Wallet | https://github.com/stellar/freighter |
| Next.js (Frontend) | https://nextjs.org/docs |
| React | https://react.dev/reference/react |
| Express.js (Backend) | https://expressjs.com/en/api.html |
| Node.js | https://nodejs.org/api |
| PostgreSQL | https://www.postgresql.org/docs/ |
| Redis | https://redis.io/docs/ |
| TypeScript | https://www.typescriptlang.org/docs/ |
| Tailwind CSS | https://tailwindcss.com/docs |
| Rust | https://doc.rust-lang.org/book/ |
| Docker | https://docs.docker.com/ |

### Additional AI Agent Rules
All other AI agent rules (file creation, modification, when to ask vs. act, prohibited actions, output rules) are defined in `AGENTS.md` §9. **Read `AGENTS.md` before contributing.**

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

All directories and placeholder files have been scaffolded. The following remains:

1. **Smart contracts** — Implement full Soroban contract logic (anchor registration, rate storage, routing, payment, admin, events) per DESIGN.md §2
2. **Backend** — Implement Express API (SEP-10 auth, rate comparison, transactions, anchor management) per DESIGN.md §3
3. **Oracle** — Implement rate fetching, validation, caching, and contract publishing per DESIGN.md §4
4. **Frontend** — Build Next.js app with wallet connection, rate comparison UI, send flow, transaction history, anchor dashboard
5. **Database** — Apply migrations and seed test data per DESIGN.md §5
6. **Tests** — Write comprehensive test suites for all components
