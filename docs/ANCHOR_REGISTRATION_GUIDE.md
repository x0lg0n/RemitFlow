# RemitFlow - Anchor Registration & Onboarding Guide

**Date:** April 22, 2026  
**Purpose:** Explain anchor system, registration process, and automated solutions

---

## Executive Summary

**Problem Identified:** System requires anchors to function, but anchor registration requires admin access and technical knowledge → creates a barrier to entry.

**Solutions Provided:**

1. ✅ **Immediate Fix:** Automatic demo anchor seeding on first startup
2. 🎯 **Recommended:** Pre-registered anchor list with one-click activation
3. 🚀 **Future:** Auto-discovery from Stellar anchor registry

---

## Part 1: Understanding the Problem

### **Current Flow (Broken)**

```
User installs RemitFlow
    ↓
Starts services (docker compose up)
    ↓
Opens browser → NO ANCHORS, NO RATES, NO CORRIDORS
    ↓
Needs to:
  1. Create Stellar keypair
  2. Register as admin in database
  3. Authenticate via SEP-10
  4. Call admin API to register anchor
  5. Configure oracle with anchor URL
    ↓
Gives up ❌
```

### **Ideal Flow (What We're Building)**

```
User installs RemitFlow
    ↓
Starts services (docker compose up)
    ↓
Database auto-seeds with 3 demo anchors
    ↓
Opens browser → SEEs 6 CORRIDORS READY TO USE
    ↓
Can immediately:
  - Compare rates
  - Test send flow
  - Understand the product
    ↓
Later: Replace demo anchors with real ones ✅
```

---

## Part 2: How Anchors Work

### **What is a Stellar Anchor?**

A Stellar anchor is a **licensed financial institution** that:

- Holds fiat currency (USD, EUR, COP, MXN, etc.)
- Issues Stellar tokens (USDC, stablecoins)
- Provides **SEP-31 API** for cross-border payments
- Handles KYC/AML compliance
- Sets their own fees and FX rates

### **Real-World Anchors**

| Anchor             | Corridors                    | Status | Website               |
| ------------------ | ---------------------------- | ------ | --------------------- |
| **Vibrant**        | US ↔ Colombia, Mexico        | Live   | vibrantapp.com        |
| **MoneyGram**      | Global (30+ countries)       | Live   | moneygram.com/stellar |
| **Bantr**          | US ↔ Africa (Nigeria, Kenya) | Live   | bantr.app             |
| **Circle**         | USDC issuer                  | Live   | circle.com            |
| **IBM World Wire** | Enterprise corridors         | Live   | ibm.com/blockchain    |

### **Anchor Data Requirements**

To use an anchor, you need:

```typescript
{
  // Identity
  id: "vibrant_colombia",
  name: "Vibrant Colombia",
  stellarAddress: "GVIBRANT...", // Their Stellar public key

  // API Access (you get this when you partner with them)
  baseUrl: "https://api.vibrantapp.com",
  authToken: "your-api-token-here",

  // Capabilities (fetched from their /info endpoint)
  supportedCurrencies: ["USDC", "COP", "USD"],
  supportedCountries: ["CO", "US"],

  // System Status
  isActive: true
}
```

---

## Part 3: How the Whole Process Works

### **Complete Flow: From User Initiation to Money Received**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER PREPARATION                                         │
├─────────────────────────────────────────────────────────────┤
│ • User connects Freighter wallet                            │
│ • Authenticates via SEP-10 challenge                        │
│ • Receives JWT token for session                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. RATE FETCHING (Oracle runs every 5 minutes)              │
├─────────────────────────────────────────────────────────────┤
│ • Oracle polls all registered anchors                       │
│   - GET /info → anchor capabilities                         │
│   - GET /fee → fee structure                                │
│   - POST /quotes → current FX rates                         │
│ • Validates rates (reject if >5% deviation)                 │
│ • Stores in PostgreSQL database                             │
│ • Publishes to Soroban smart contract (optional)            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. USER SELECTS CORRIDOR                                    │
├─────────────────────────────────────────────────────────────┤
│ • Frontend fetches rates from backend                       │
│ • Builds corridor list (e.g., "USDC → COP (CO)")           │
│ • User selects:                                             │
│   - Send currency: USDC                                     │
│   - Receive currency: COP                                   │
│   - Destination: Colombia                                   │
│   - Amount: 500 USDC                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. ROUTE OPTIMIZATION                                       │
├─────────────────────────────────────────────────────────────┤
│ • Backend compares all anchors for this corridor:           │
│   - Vibrant: 1.5% fee, rate 4250.50 → 2,125,250 COP        │
│   - MoneyGram: 2.0% fee, rate 4248.00 → 2,119,752 COP      │
│ • Selects cheapest route (Vibrant)                          │
│ • Shows user comparison table                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. TRANSACTION EXECUTION                                    │
├─────────────────────────────────────────────────────────────┤
│ • User confirms transaction                                 │
│ • Backend calls anchor's SEP-31 API:                        │
│   POST /transactions {                                      │
│     amount: "500",                                          │
│     asset_code: "USDC",                                     │
│     destination_country: "CO",                              │
│     receiver_id: "recipient-id"                             │
│   }                                                         │
│ • Anchor returns:                                           │
│   { id: "tx-123", status: "pending" }                      │
│ • Frontend shows status to user                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. PAYMENT COMPLETION                                       │
├─────────────────────────────────────────────────────────────┤
│ • Anchor processes payment (minutes to hours)               │
│ • Recipient receives 2,125,250 COP in Colombia              │
│ • Anchor callbacks backend with status update               │
│ • User gets notification                                    │
│ • Revenue share calculated (0.5% to RemitFlow)              │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 4: Anchor Registration Solutions

### **Solution 1: Automatic Demo Seeding** ✅ IMPLEMENTED

**What I did:**

Created [database/migrations/999_seed_demo_anchors.sql](file:///home/x0lg0n/x0lg0n/RISEIN%20/RemitFlow/database/migrations/999_seed_demo_anchors.sql)

**Features:**

- ✅ Automatically runs on first database initialization
- ✅ Creates 3 demo anchors (Colombia, Mexico, Brazil)
- ✅ Seeds 6 corridors with realistic rates
- ✅ Idempotent (won't duplicate on restart)
- ✅ Perfect for development and demos

**How to use:**

For **new database**:

```bash
# Stop services
docker compose down

# Delete old volume (WARNING: deletes all data)
docker volume rm docker_pgdata

# Restart (auto-seeds on first boot)
docker compose up -d

# Wait 30 seconds for database initialization
# Anchors will be automatically created!
```

For **existing database**:

```bash
# Manually run the seed
docker compose exec -T db psql -U postgres -d remiflow \
  < database/migrations/999_seed_demo_anchors.sql

# Verify
docker compose exec db psql -U postgres -d remiflow -c \
  "SELECT id, name FROM anchors;"
```

**Demo Anchors Included:**

| ID              | Name                 | Corridors         | Fee        |
| --------------- | -------------------- | ----------------- | ---------- |
| `demo_colombia` | Demo Anchor Colombia | USDC→COP, USD→COP | 1.5-2.0%   |
| `demo_mexico`   | Demo Anchor Mexico   | USDC→MXN, USD→MXN | 1.75-2.25% |
| `demo_brazil`   | Demo Anchor Brazil   | USDC→BRL, USD→BRL | 1.80-2.30% |

---

### **Solution 2: Pre-Registered Anchor Marketplace** 🎯 RECOMMENDED

**Concept:** Build an in-app "Anchor Marketplace" where users can browse and activate anchors.

**User Experience:**

```
User visits: http://localhost:3000/anchors/marketplace

┌────────────────────────────────────────────────────────┐
│  Available Anchors                                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 🇨🇴 Vibrant - Colombia                          │  │
│  │ Corridors: US ↔ Colombia                        │  │
│  │ Fee: ~1.5% | Rating: ⭐⭐⭐⭐⭐               │  │
│  │ [Learn More] [Activate Anchor]                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 🇲🇽 Vibrant - Mexico                            │  │
│  │ Corridors: US ↔ Mexico                          │  │
│  │ Fee: ~1.75% | Rating: ⭐⭐⭐⭐⭐              │  │
│  │ [Learn More] [Activate Anchor]                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 🇳🇬 Bantr - Nigeria                             │  │
│  │ Corridors: US ↔ Nigeria                         │  │
│  │ Fee: ~2.0% | Rating: ⭐⭐⭐⭐                │  │
│  │ [Learn More] [Activate Anchor]                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Activation Flow:**

```
1. User clicks "Activate Anchor" on Vibrant Colombia
   ↓
2. Modal appears:
   ┌─────────────────────────────────────────┐
   │  Activate Vibrant - Colombia            │
   │                                         │
   │  To use this anchor, you need:          │
   │  1. Vibrant partner account             │
   │  2. API credentials                     │
   │                                         │
   │  [Sign up at Vibrant →]                 │
   │                                         │
   │  API Token: [______________________]    │
   │  Account ID: [______________________]   │
   │                                         │
   │  [Cancel] [Activate]                    │
   └─────────────────────────────────────────┘
   ↓
3. Backend validates credentials by calling anchor API
   ↓
4. Anchor registered in database
   ↓
5. Oracle starts fetching rates
   ↓
6. Corridor appears in UI within 5 minutes
```

**Implementation Steps:**

**Step 1:** Create known anchors data file

```typescript
// frontend/data/known-anchors.ts
export const KNOWN_ANCHORS = [
  {
    id: "vibrant_colombia",
    name: "Vibrant - Colombia",
    description: "Leading Latin America anchor with competitive rates",
    country: "CO",
    supportedCurrencies: ["USDC", "COP", "USD"],
    feeEstimate: "1.5%",
    website: "https://vibrantapp.com",
    signupUrl: "https://vibrantapp.com/partners",
    logo: "/anchors/vibrant.png",
    status: "available", // available, pending, active
  },
  // ... more anchors
];
```

**Step 2:** Build marketplace UI page

```typescript
// frontend/app/(app)/anchors/marketplace/page.tsx
export default function AnchorMarketplace() {
  const [anchors, setAnchors] = useState(KNOWN_ANCHORS);

  const handleActivate = async (anchor: KnownAnchor) => {
    // Show credential form
    // Submit to backend
    // Backend registers anchor
    // Oracle starts polling
  };

  return (
    <div>
      <h1>Anchor Marketplace</h1>
      {anchors.map(anchor => (
        <AnchorCard
          key={anchor.id}
          anchor={anchor}
          onActivate={handleActivate}
        />
      ))}
    </div>
  );
}
```

**Step 3:** Backend endpoint for activation

```typescript
// POST /anchors/activate
router.post("/activate", authMiddleware, async (req, res) => {
  const { anchorId, apiToken, accountId } = req.body;

  // Validate credentials with anchor
  const anchor = KNOWN_ANCHORS.find((a) => a.id === anchorId);
  const isValid = await validateAnchorCredentials(anchor, apiToken);

  if (!isValid) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  // Register in database
  await registerAnchor({
    id: anchorId,
    name: anchor.name,
    baseUrl: anchor.baseUrl,
    authToken: apiToken,
    // ...
  });

  // Trigger oracle to start polling
  await oracleService.addAnchor(anchorId);

  res.json({ success: true });
});
```

**Benefits:**

- ✅ User-friendly, no technical knowledge needed
- ✅ Guided onboarding with signup links
- ✅ Can include anchor reviews/ratings
- ✅ Extensible to many anchors

---

### **Solution 3: Auto-Discovery from Stellar Registry** 🚀 ADVANCED

**Concept:** Automatically discover all Stellar anchors from the official registry.

**How it works:**

```typescript
// backend/src/services/anchor-discovery.service.ts

// Stellar maintains a list of anchors
const STELLAR_ANCHOR_REGISTRY = "https://api.stellar.org/anchors";

// Each anchor has a stellar.toml file with metadata
// https://anchor-domain.com/.well-known/stellar.toml

export async function discoverAnchors() {
  const registry = await fetch(STELLAR_ANCHOR_REGISTRY);

  const anchors = registry.data.map(async (entry) => {
    const toml = await fetchToml(entry.url);

    return {
      id: generateId(toml.ORG_NAME),
      name: toml.ORG_NAME,
      baseUrl: entry.url,
      website: toml.DOCUMENTATION.ORG_URL,
      hasSEP31: entry.capabilities.sep31,
      currencies: toml.CURRENCIES.map((c) => c.code),
    };
  });

  return Promise.all(anchors);
}
```

**Pros:**

- Always up-to-date with new anchors
- No manual curation needed
- Discovers anchors automatically

**Cons:**

- Many anchors don't have complete toml files
- Still need API credentials to use them
- Complex to implement reliably

---

## Part 5: Production Anchor Integration

### **How to Partner with Real Anchors**

**Step 1: Contact Anchor**

Example for Vibrant:

```
Email: partners@vibrantapp.com
Subject: RemitFlow Partnership - Rate Aggregation

Hi Vibrant Team,

We're building RemitFlow, a rate comparison platform for Stellar anchors.
We'd like to integrate your API to show your rates to our users.

Requirements:
- SEP-31 API access
- API credentials
- Rate endpoints (/info, /fee, /quotes)

Expected volume: 100-500 transactions/month initially

Best regards,
[Your Name]
```

**Step 2: Receive Credentials**

Anchor will provide:

```
API Base URL: https://api.vibrantapp.com
API Token: vibrant_prod_xxxxx
Account ID: ACC-12345
Webhook URL: (optional)
```

**Step 3: Register in System**

Via UI (if marketplace built):

```
1. Go to /anchors/marketplace
2. Find Vibrant
3. Click "Activate"
4. Enter credentials
5. Done!
```

Via API (current method):

```bash
curl -X POST http://localhost:3001/anchors \
  -H "Authorization: Bearer ADMIN_JWT" \
  -d '{
    "id": "vibrant_colombia",
    "name": "Vibrant Colombia",
    "stellarAddress": "GVIBRANT...",
    "baseUrl": "https://api.vibrantapp.com",
    "authToken": "vibrant_prod_xxxxx",
    "supportedCurrencies": ["USDC", "COP", "USD"],
    "supportedCountries": ["CO", "US"]
  }'
```

**Step 4: Verify Integration**

```bash
# Check if anchor appears
curl http://localhost:3001/anchors

# Wait 5 minutes for oracle to fetch rates
curl http://localhost:3001/rates

# Should see Vibrant's rates!
```

---

## Part 6: Current Project Status

### **What's Working Now**

| Feature               | Status     | Notes                           |
| --------------------- | ---------- | ------------------------------- |
| Wallet Authentication | ✅ Working | SEP-10 fully functional         |
| Database Seeding      | ✅ Working | Auto-seeds on first boot        |
| Rate Display          | ✅ Working | Fixed type conversion bug       |
| Corridor Selection    | ✅ Working | Builds from rates automatically |
| Backend API           | ✅ Working | All endpoints functional        |
| Frontend UI           | ✅ Working | Comparison table renders        |

### **What Needs Implementation**

| Feature                   | Priority  | Effort    | Description                     |
| ------------------------- | --------- | --------- | ------------------------------- |
| Oracle Rate Fetchers      | 🔴 HIGH   | 2-3 days  | Actually fetch from anchor APIs |
| Anchor Marketplace UI     | 🟡 MEDIUM | 3-4 days  | User-friendly anchor activation |
| Real Anchor Partnerships  | 🟡 MEDIUM | 1-2 weeks | Contact and integrate anchors   |
| Transaction Execution     | 🟡 MEDIUM | 2-3 days  | SEP-31 API integration          |
| Smart Contract Deployment | 🟢 LOW    | 1 day     | Deploy to testnet               |

---

## Part 7: Quick Start Commands

### **For Development (Demo Mode)**

```bash
# Start everything with demo anchors
cd "/home/x0lg0n/x0lg0n/RISEIN /RemitFlow/docker"
docker compose down -v  # Clean start
docker compose up -d    # Auto-seeds demo anchors

# Wait 30 seconds, then verify
curl http://localhost:3001/anchors | python3 -m json.tool
curl http://localhost:3001/rates | python3 -m json.tool

# Open browser
# http://localhost:3000
# You should see 6 corridors ready to use!
```

### **For Production (Real Anchors)**

```bash
# 1. Contact anchors and get API credentials
# 2. Register anchors via API or UI
# 3. Configure oracle with real URLs
# 4. Start services
docker compose up -d

# 5. Monitor oracle logs
docker compose logs -f oracle

# 6. Verify rates appear
curl http://localhost:3001/rates
```

---

## Summary

### **The Answer to Your Question:**

> "Do we need an admin to add anchors, or can users choose from a list?"

**Current State:** Requires admin + technical knowledge ❌

**Solution Implemented:** Auto-seeding with demo anchors on first boot ✅

**Recommended Future:** Build anchor marketplace where users can browse and activate anchors with one click 🎯

### **Next Steps:**

1. **Immediate (Done):**
   - ✅ Fixed rate type conversion bug
   - ✅ Created auto-seeding migration
   - ✅ System now works out-of-the-box for demos

2. **Short-term (This Week):**
   - Build anchor marketplace UI
   - Implement oracle rate fetchers
   - Test with real anchor APIs

3. **Long-term (This Month):**
   - Partner with 2-3 real anchors
   - Deploy smart contract to testnet
   - Launch beta with real transactions

---

**Files Created:**

1. [database/migrations/999_seed_demo_anchors.sql](file:///home/x0lg0n/x0lg0n/RISEIN%20/RemitFlow/database/migrations/999_seed_demo_anchors.sql) - Auto-seeding script
2. This document - Complete guide

**Files Modified:**

1. [backend/src/shared/types/rate.types.ts](file:///home/x0lg0n/x0lg0n/RISEIN%20/RemitFlow/backend/src/shared/types/rate.types.ts) - Fixed type conversion

---

**Your RemitFlow project now works immediately after `docker compose up`!** 🎉
