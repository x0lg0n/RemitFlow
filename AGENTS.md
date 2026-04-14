# RemitFlow — Project Rules & Working Guidelines

**Version:** 1.0  
**Last Updated:** April 2026  
**Applies to:** All contributors (human and AI)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Principles](#2-core-principles)
   2.1 [Non-Negotiables](#21-non-negotiables)
   2.2 [Official Documentation Sources (MANDATORY)](#22-official-documentation-sources-mandatory-verification)
   2.3 [Decision Hierarchy](#23-decision-hierarchy)
3. [Codebase Structure](#3-codebase-structure)
4. [Rules for All Contributors](#4-rules-for-all-contributors)
5. [Coding Standards by Component](#5-coding-standards-by-component)
6. [Security Rules (MANDATORY)](#6-security-rules-mandatory)
7. [Testing Rules](#7-testing-rules)
8. [Git Workflow & PR Rules](#8-git-workflow--pr-rules)
9. [Rules Specific to AI Agents](#9-rules-specific-to-ai-agents)
10. [Review Checklist](#10-review-checklist)

---

## 1. Project Overview

**RemitFlow** is a Soroban-powered cross-border payment aggregator that routes remittances through the cheapest Stellar anchor pair, saving users 3–5% on fees.

| Component | Language | Location |
|-----------|----------|----------|
| Smart Contract | Rust (Soroban) | `smart-contracts/contracts/remiflow/` |
| Backend API | TypeScript (Node.js + Express) | `backend/` |
| Rate Oracle | TypeScript (Node.js) | `oracle/` |
| Frontend | TypeScript (Next.js 15 App Router) | `frontend/` |
| Database | PostgreSQL 15 | `database/` |

**Key Protocols:** SEP-31 (cross-border payments), SEP-10 (authentication)

---

## 2. Core Principles

### 2.1 Non-Negotiables

1. **ALWAYS verify implementation against official, up-to-date documentation before writing code** — never rely on training memory alone. Use `web_search` and `web_fetch` to check the latest official docs for every component you touch (see Section 2.3 for the official source list)
2. **Never commit secrets, keys, or credentials** — use `.env` files (never committed)
3. **Never modify auth/security logic without explicit approval** — SEP-10, JWT, wallet connection
4. **Always run tests before marking work complete** — no untested code merges
5. **Always match existing code style** — do not introduce new patterns
6. **Always update documentation** when changing public APIs or contract interfaces

### 2.2 Official Documentation Sources (MANDATORY VERIFICATION)

Every AI agent and contributor **MUST** consult the latest official documentation before implementing, modifying, or reviewing code. Never rely on outdated patterns, assumptions, or training data alone. Use `web_search` and `web_fetch` to verify.

| Component | Official Documentation Source | What to Verify |
|-----------|------------------------------|----------------|
| **Soroban Smart Contracts** | [soroban.stellar.org/docs](https://soroban.stellar.org/docs) | SDK APIs, contract types, auth patterns, storage, events, test framework, CLI commands |
| **Stellar Protocols (SEP-31, SEP-10)** | [developers.stellar.org/docs](https://developers.stellar.org/docs) | SEP-31 flow, SEP-10 challenge format, anchor API spec, SEP-12 KYC |
| **Stellar SDK** | [stellar.github.io/js-stellar-sdk](https://stellar.github.io/js-stellar-sdk/) | Transaction building, Soroban RPC, signing, submission |
| **Freighter Wallet** | [github.com/stellar/freighter](https://github.com/stellar/freighter) | `@stellar/freighter-api` methods, connection flow, signing |
| **Next.js (Frontend)** | [nextjs.org/docs](https://nextjs.org/docs) | App Router, Server Components, route handlers, metadata, caching |
| **React** | [react.dev/reference](https://react.dev/reference/react) | Hooks, context, component patterns, error boundaries |
| **Express.js (Backend)** | [expressjs.com/en/api.html](https://expressjs.com/en/api.html) | Routing, middleware, error handling, response methods |
| **Node.js** | [nodejs.org/api](https://nodejs.org/api) | Streams, crypto, fs, HTTP, process management |
| **PostgreSQL** | [postgresql.org/docs](https://www.postgresql.org/docs/) | Query syntax, indexes, constraints, performance |
| **Redis** | [redis.io/docs](https://redis.io/docs/) | Caching patterns, pub/sub, data structures |
| **TypeScript** | [typescriptlang.org/docs](https://www.typescriptlang.org/docs/) | Type system, generics, module resolution |
| **Tailwind CSS** | [tailwindcss.com/docs](https://tailwindcss.com/docs) | Utility classes, config, dark mode, plugins |
| **Rust** | [doc.rust-lang.org/book](https://doc.rust-lang.org/book/) | Ownership, traits, error handling, macros |
| **Docker** | [docs.docker.com](https://docs.docker.com/) | Compose, multi-stage builds, networking, volumes |

**Verification workflow for AI agents:**

1. Before writing any code → `web_search` for the latest API/pattern you need
2. If documentation has a quick reference → `web_fetch` the relevant page
3. Cross-check your implementation against the official API — do not invent methods
4. If the official docs differ from what's in `DESIGN.md` → follow the **official docs** and flag the discrepancy
5. When in doubt between two approaches → search for community best practices + official stance

### 2.3 Decision Hierarchy

| Change Type | Approval Needed |
|-------------|----------------|
| New dependency | Tech Lead review |
| Contract interface change | Tech Lead + team review |
| Public API change | Tech Lead review |
| Security-adjacent code | Tech Lead + explicit approval |
| Bug fix in existing code | PR review only |
| Documentation only | No approval needed |

---

## 3. Codebase Structure

```
RemitFlow/
├── smart-contracts/
│   └── contracts/
│       └── remiflow/    # Soroban smart contract (Rust)
│           ├── src/
│           └── Cargo.toml
├── backend/src/           # Express API server
│   ├── routes/            # Express route definitions
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── middleware/        # Auth, validation, error handling
│   ├── validators/        # Zod schemas
│   ├── config/            # DB, Redis, Stellar config
│   └── types/             # TypeScript interfaces
├── oracle/src/            # Rate oracle service
│   ├── fetchers/          # Per-anchor rate fetchers
│   ├── validators/        # Multi-source validation
│   ├── publisher/         # Soroban contract publisher
│   ├── cache/             # Redis caching
│   └── monitoring/        # Circuit breakers + alerts
├── frontend/              # Next.js 15 App Router
│   ├── app/               # Route handlers + pages
│   ├── components/        # React components
│   ├── lib/               # Utilities, API client, Stellar helpers
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React contexts
│   └── types/             # TypeScript interfaces
├── database/migrations/   # SQL migrations (numbered)
├── docker/                # Docker Compose configs
├── scripts/               # Deployment/ops scripts
├── tests/                 # E2E, integration, performance tests
└── docs/                  # Technical documentation
```

---

## 4. Rules for All Contributors

### 4.1 File Organization

- **One concern per file** — do not mix unrelated logic
- **Colocate tests** — contract tests in `smart-contracts/contracts/remiflow/src/test/`, backend tests in `tests/integration/`
- **Use the existing directory structure** — do not create new top-level dirs without approval
- **Name files consistently**:
  - Backend: `kebab-case.ts` for routes, `camelCase.service.ts` for services
  - Frontend: `PascalCase.tsx` for components, `camelCase.ts` for utils
  - Contracts: `snake_case.rs`
  - Oracle: `camelCase.fetcher.ts`, `camelCase.service.ts`

### 4.2 Dependencies

- **Never add dependencies without justification** in the PR description
- **Check for existing equivalents** before adding new packages
- **Pin all versions** — no `^` or `~` in production dependencies for critical packages
- **Smart contracts must use `#![no_std]`** — only Soroban SDK dependencies allowed

### 4.3 Error Handling

- **Never swallow errors** — always log, re-throw, or return structured error responses
- **Backend:** Return `{ success: false, error: { code, message } }` format
- **Contracts:** Use typed `Error` enum (see `DESIGN.md` §2.1)
- **Frontend:** Display user-friendly error messages, log technical details to console
- **Oracle:** Log failures, trigger circuit breaker after 3 consecutive failures

### 4.4 Type Safety

- **No `any` in TypeScript** — use `unknown` with type guards if needed
- **All API responses must be typed** — use interfaces in `types/`
- **Contract types must derive from `#[contracttype]`** — no raw `Val` in public APIs
- **Never use `as` type assertions** without a comment explaining why

### 4.5 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Rust modules/files | `snake_case` | `rate_service.rs` |
| Rust structs/enums | `PascalCase` | `AnchorRate` |
| Rust functions | `snake_case` | `find_best_route` |
| TS/JS files | `camelCase` or `PascalCase` (components) | `useWallet.ts`, `RateCard.tsx` |
| TS functions/variables | `camelCase` | `fetchRates` |
| TS interfaces/types | `PascalCase` | `AnchorRate` |
| Database tables | `snake_case` (plural) | `anchor_revenue` |
| Environment variables | `UPPER_SNAKE_CASE` | `STELLAR_RPC_URL` |
| API endpoints | `kebab-case` in URL | `/rates/best` |

---

## 5. Coding Standards by Component

### 5.1 Smart Contracts (Rust / Soroban)

```rust
// REQUIRED: Every file must start with
#![no_std]

// REQUIRED: All public functions must have doc comments
/// Register a new anchor for routing.
///
/// # Arguments
/// * `e` - Soroban environment
/// * `admin` - Admin address for authorization
/// * `anchor` - Anchor data to store
///
/// # Errors
/// * `Error::Unauthorized` - If caller is not admin
/// * `Error::AnchorNotFound` - If anchor ID does not exist
pub fn register_anchor(
    e: &Env,
    admin: Address,
    anchor: Anchor,
) -> Result<(), Error> {
    admin.require_auth();
    // implementation
}
```

**Contract Rules:**

- Use `i128` for all monetary amounts — never overflow-prone types
- Always call `require_auth()` on admin/user addresses in state-mutating functions
- Emit events for ALL state changes (see `events.rs`)
- Never use `panic!()` — return typed `Error` instead
- Storage keys must use the defined schema in `DESIGN.md` §2.2
- TTL management: rates expire after 24 hours, everything else is permanent
- Maximum contract size: stay under Soroban limits — split logic into modules
- Test coverage minimum: **90%**

### 5.2 Backend API (TypeScript / Express)

```typescript
// Route definition
router.post("/best", validateRateRequest, ratesController.getBestRoute);

// Controller
async getBestRoute(req: Request, res: Response): Promise<void> {
  try {
    const result = await rateService.findBestRoute(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { code: "RATE_NOT_FOUND", message: "No routes available" }
    });
  }
}

// Service
async findBestRoute(request: RouteRequest): Promise<AnchorRate> {
  const rates = await this.getAllActiveRates();
  const filtered = this.filterByCurrencyPair(rates, request);
  return this.selectCheapest(filtered);
}
```

**Backend Rules:**

- **Routes** — only define URL patterns + wire to controllers. No business logic.
- **Controllers** — only handle HTTP concerns (status codes, request parsing, responses).
- **Services** — contain all business logic. Must be independently testable.
- **Validators** — Zod schemas at the route level. Never trust client input.
- **Middleware** — must call `next()` or return a response. Never leave requests hanging.
- All async functions must have `try/catch` or be handled by error middleware.
- Database queries must use parameterized queries — **never string interpolation in SQL**.
- Response format: `{ success: boolean, data?: T, error?: { code: string, message: string } }`
- Test coverage minimum: **80%**

### 5.3 Frontend (Next.js 15 / React / TypeScript)

```tsx
// Page component with route group
export default function SendPage() {
  const { rates, isLoading } = useRates();
  const { isConnected } = useWallet();

  if (!isConnected) return <WalletPrompt />;
  if (isLoading) return <Skeleton />;

  return <SendForm rates={rates} />;
}

// Custom hook
function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  return { isConnected, address, connect, disconnect };
}
```

**Frontend Rules:**

- **App Router only** — no Pages Router. Use route groups `(auth)`, `(app)`, `(anchor)`.
- **Server Components by default** — add `"use client"` only when needed (state, hooks, events).
- **Components** — functional only, no class components. Use hooks for state.
- **API calls** — use `lib/api.ts` client, never call `fetch()` directly in components.
- **Wallet integration** — always go through `WalletProvider` context, never call Freighter API directly.
- **Styling** — Tailwind CSS only. No CSS-in-JS, no inline styles except dynamic values.
- **Forms** — validate on client (Zod) AND server. Never trust client validation alone.
- **Error boundaries** — wrap each page route with error boundary.
- **Accessibility** — all interactive elements must have `aria-label` or visible text.
- Test coverage minimum: **70%**

### 5.4 Oracle Service (TypeScript / Node.js)

```typescript
// Rate fetcher
async fetchAnchorRates(anchor: AnchorConfig): Promise<AnchorRate> {
  const [feeData, quoteData] = await Promise.allSettled([
    this.fetchFee(anchor),
    this.fetchQuote(anchor),
  ]);

  if (feeData.status === "rejected" || quoteData.status === "rejected") {
    this.recordFailure(anchor.id);
    throw new Error(`Failed to fetch rates for ${anchor.id}`);
  }

  return {
    anchorId: anchor.id,
    feePercent: this.parseFee(feeData.value),
    fxRate: this.parseRate(quoteData.value),
    lastUpdated: Date.now(),
  };
}
```

**Oracle Rules:**

- **Always use `Promise.allSettled`** for multi-anchor fetching — one anchor failure must not block others.
- **Cache every fetch** — Redis TTL of 5 minutes minimum.
- **Validate before publishing** — reject rates that deviate >5% from median (circuit breaker).
- **Never publish stale rates** — skip update if rates are older than 10 minutes.
- **Log every action** — fetch success/failure, validation result, contract publish result.
- **Idempotent operations** — re-running the same rate update must not cause duplicate contract writes.
- Test coverage minimum: **85%**

---

## 6. Security Rules (MANDATORY)

### 6.1 Universal Security Rules

1. **NEVER commit secrets** — API keys, private keys, passwords, tokens
2. **NEVER hardcode credentials** — always use environment variables
3. **NEVER log sensitive data** — no wallet addresses with private keys, no auth tokens in logs
4. **NEVER expose private keys** — oracle key must be injected via env var, never in code or config files
5. **Always validate user input** — Zod for TS, type validation for Rust
6. **Always use parameterized queries** — no SQL string concatenation

### 6.2 Smart Contract Security

- All state-mutating functions must call `require_auth()`
- Admin functions must verify admin address
- Rate staleness check: reject rates older than 30 minutes
- Emergency pause must be accessible and tested
- No reentrancy — Soroban provides protection, but verify manually
- All amounts use `i128` — no integer overflow possible
- **Before any mainnet deployment: third-party audit required**

### 6.3 Backend Security

- JWT expiry: 24 hours maximum
- SEP-10 challenge nonce must be unique per request
- Rate limiting: 100 requests/minute per IP
- CORS: whitelist only production domains
- Helmet middleware: enabled in all environments
- Input validation: Zod schemas on all public endpoints
- **Never return stack traces or internal errors to clients**

### 6.4 Frontend Security

- Never store JWT in localStorage — use httpOnly cookies (handled by backend)
- Freighter wallet: only use official `@stellar/freighter-api` — never request private keys
- CSP headers: configured in Next.js config
- **Never render raw user input without sanitization**

### 6.5 Oracle Security

- Oracle private key: injected via `ORACLE_SECRET` env var only
- Anchor auth tokens: stored in database, encrypted at rest
- Circuit breaker: pause contract updates after 3 consecutive failures
- Multi-source validation: never trust a single anchor's rates

---

## 7. Testing Rules

### 7.1 General Testing Rules

- **All new features require tests** — no exceptions
- **Bug fixes require regression tests** — test the specific bug case
- **Coverage must not decrease** — PRs that lower coverage will be rejected
- **Tests must be deterministic** — no flaky tests, use mocking for external calls

### 7.2 Component-Specific Testing

| Component | Min Coverage | Test Framework | What to Test |
|-----------|-------------|----------------|-------------|
| Smart Contract | 90% | Soroban Test Framework | All public functions, error cases, auth checks |
| Backend API | 80% | Jest | All routes, services, validators, middleware |
| Frontend | 70% | React Testing Library | Components, hooks, form validation, error states |
| Oracle | 85% | Jest | Fetchers, validation, circuit breakers, caching |

### 7.3 Test Naming

```typescript
// Backend/Oracle/Frontend
describe("RateService", () => {
  describe("findBestRoute", () => {
    it("should return the cheapest route when multiple anchors are available", () => {});
    it("should throw when no routes match the currency pair", () => {});
    it("should filter out inactive anchors", () => {});
  });
});

// Smart Contract
#[test]
fn test_register_anchor_succeeds_for_admin() {}

#[test]
fn test_register_anchor_fails_for_unauthorized_user() {}
```

### 7.4 Integration Tests
- Must use test database (never production)
- Must mock external API calls (anchor APIs, Stellar RPC)
- Must clean up after themselves (use transactions with rollback)

---

## 8. Git Workflow & PR Rules

### 8.1 Branch Naming
```
feature/anchor-integration
bugfix/rate-calculation-overflow
hotfix/security-patch
docs/api-documentation
refactor/service-extraction
```

### 8.2 Commit Messages (Conventional Commits)
```
feat: add anchor B rate fetching
fix: resolve overflow in fee calculation
docs: update API documentation for rates endpoint
test: add integration tests for oracle validator
chore: update stellar-sdk to v11.0.0
refactor: extract rate comparison logic to service
```

### 8.3 PR Requirements
Every pull request must include:
1. **Description** — what changed and why
2. **Testing** — how it was tested (manual + automated)
3. **Screenshots** (for UI changes)
4. **Breaking changes** — if any, with migration steps
5. **Related issues** — link to GitHub issues

### 8.4 PR Review Rules
- **Minimum 1 approval** from a team member
- **Contract changes** require Tech Lead approval
- **All CI checks must pass** before merge
- **No force-pushing** to shared branches
- **Squash merge** to main — keep history clean

---

## 9. Rules Specific to AI Agents

### 9.0 AI Role: Project Manager & Technical Head
AI agents are expected to operate as **Project Manager and Technical Head** for this project. This means:
- **Own the technical quality** of every file you create or modify — production-ready, industry-standard
- **Anticipate next steps** — if a feature requires a config file, create it. If a service needs a type, define it
- **Enforce standards** — reject patterns that don't match industry best practices
- **Track progress** — use the todo list to plan, execute, and report on multi-step tasks
- **Flag risks proactively** — if a design decision conflicts with official docs, call it out
- **Think like an architect** — consider scalability, security, maintainability, and developer experience in every change

### 9.1 Verify Against Official Documentation (FIRST RULE — Applies Before Every Action)
This is the **single most important rule** for AI agents. Before writing, modifying, or reviewing any code:

1. **Identify which technology** you're working with (Soroban, Next.js, Express, etc.)
2. **Use `web_search`** to find the latest official documentation for the specific API/pattern you need
3. **Use `web_fetch`** to read the relevant documentation page
4. **Cross-check** your planned implementation against what the official docs say
5. **If official docs differ from `DESIGN.md` or existing code** → follow the official docs and flag the discrepancy
6. **If you're unsure between two approaches** → search for community best practices, blog posts, and official recommendations

**Never implement based on memory, assumptions, or outdated patterns.** Technology changes fast — Stellar's Soroban SDK, Next.js App Router, and Express middleware patterns evolve constantly. Always verify first.

### 9.2 How to Read Before Writing
1. **Always read the target file** before editing it — use `read_file` first
2. **Check surrounding files** for patterns, types, and imports to match
3. **Read `DESIGN.md`** before modifying any component — it is the source of truth for architecture
4. **Read `PRD.md`** before adding features — verify the feature is in scope
5. **Check existing tests** before writing new ones — match the test patterns

### 9.3 File Creation Rules
- **Only create files that match the project structure** in Section 3
- **Always create the file with meaningful content** — no empty placeholder files (except during scaffolding)
- **When adding a new file, ask:** does it fit an existing directory? Does it need a new directory?
- **Never create files outside the project root**

### 9.4 File Modification Rules
- **Always use `read_file` before `edit`** — verify the current content
- **Always include sufficient context** in `edit` operations (3+ lines before and after the target)
- **Prefer `edit` over `write_file`** for partial changes — preserve unrelated content
- **When modifying a function, keep the function signature** unless the change requires it
- **Update related files** when changing interfaces (types, tests, docs)

### 9.5 When to Ask vs. When to Act
| Situation | Action |
|-----------|--------|
| Fixing a bug in existing code | Act — create PR |
| Adding a feature from PRD | Act — create PR |
| Changing contract public interfaces | Ask first |
| Modifying auth/security logic | Ask first |
| Adding new external dependency | Ask first |
| Restructuring directories | Ask first |
| Writing documentation for existing code | Act |
| Changing API response format | Ask first |
| Fixing typos / formatting | Act |
| Creating test files | Act |

### 9.6 Code Quality Rules for AI
- **Match the existing code style exactly** — indentation, naming, patterns
- **Never introduce new libraries** without asking first
- **Always add TypeScript types** — no implicit `any`
- **Always handle error cases** — happy path + error path
- **Always write tests for new code** — at the minimum coverage threshold
- **Comment the "why" not the "what"** — only comment non-obvious logic
- **Do not leave `TODO` comments** in production code — implement or flag for discussion

### 9.7 Multi-File Change Rules
When a change spans multiple files:
1. **List all affected files** before starting
2. **Update types/interfaces first** — they are the contract between modules
3. **Update implementations second** — services, controllers, components
4. **Update tests last** — they verify the implementation
5. **Verify imports resolve** — no broken imports after changes
6. **Check for cascading changes** — if you change a service interface, update all consumers

### 9.8 Prohibited Actions for AI
- **Never run destructive commands** (`rm -rf`, `DROP TABLE`, `git push --force`)
- **Never modify CI/CD pipelines** without explicit instruction
- **Never change environment variable names** in `.env.example` without approval
- **Never modify database schemas** without checking migration numbering
- **Never expose API keys, wallet addresses, or contract addresses** in code
- **Never skip tests** to make CI pass
- **Never bypass linting/type-checking** to resolve errors
- **Never modify another agent's in-progress work** without coordination

### 9.9 Output Rules
- **Be concise** — no summaries unless asked
- **Show diffs, not full files** — when explaining changes
- **Use file paths** — always reference files by their full relative path
- **Report failures immediately** — if a command fails, explain why before retrying

---

## 10. Review Checklist

Before submitting any PR, verify:

### Code Quality
- [ ] Code follows the standards in Section 5 for its component
- [ ] No `any` types in TypeScript
- [ ] No hardcoded values that should be env vars
- [ ] All imports are used and sorted correctly
- [ ] No dead code or commented-out blocks

### Testing
- [ ] New code has tests meeting coverage minimums (Section 7.2)
- [ ] Tests pass locally (`npm test`)
- [ ] Existing tests still pass

### Security
- [ ] No secrets or credentials in code
- [ ] Input is validated (Zod / type validation)
- [ ] Auth checks are in place for protected endpoints
- [ ] SQL queries are parameterized

### Documentation
- [ ] Doc comments on public functions
- [ ] API changes reflected in `docs/api.md`
- [ ] Contract interface changes noted in `DESIGN.md`

### Contract-Specific
- [ ] `require_auth()` called on state-mutating functions
- [ ] Events emitted for all state changes
- [ ] Error cases return typed errors, not panics
- [ ] No integer overflow (all amounts use `i128`)

---

**These rules apply to everyone and everything that contributes to this repository.**  
**When in doubt, ask. When uncertain, verify. When finished, test.**
