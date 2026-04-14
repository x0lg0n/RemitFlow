# RemitFlow - Technical Design Document

**Version:** 1.0  
**Last Updated:** April 2026  
**Status:** Draft - Development Ready

---

## 1. SYSTEM ARCHITECTURE

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REMITFLOW SYSTEM ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │    USER     │    │   REMITFLOW │    │   STELLAR   │    │   ANCHOR    │  │
│  │   WALLET    │───▶│   FRONTEND  │───▶│   NETWORK   │───▶│   APIs      │  │
│  │  (Freighter)│    │   (React)   │    │  (Soroban)  │    │  (SEP-31)   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                   │                   │                   │       │
│         ▼                   ▼                   ▼                   ▼       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Browser   │    │   Backend   │    │   Soroban   │    │   Anchor    │  │
│  │   / Mobile  │    │   (Node.js) │    │   Contract  │    │   Database  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                            │                   │                            │
│                            ▼                   ▼                            │
│                     ┌─────────────┐    ┌─────────────┐                      │
│                     │   Oracle    │    │   Rate      │                      │
│                     │   Service   │    │   Cache     │                      │
│                     │  (Node.js)  │    │   (Redis)   │                      │
│                     └─────────────┘    └─────────────┘                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Overview

| Component | Technology | Purpose | Owner |
|-----------|------------|---------|-------|
| Frontend | React 18.x | User interface + wallet connection | Frontend Dev |
| Backend API | Node.js 20.x + Express | REST API + business logic | Backend Dev |
| Smart Contract | Soroban (Rust) | Route optimization + payment execution | Smart Contract Dev |
| Oracle Service | Node.js + Cron | Real-time rate fetching from anchors | Backend Dev |
| Database | PostgreSQL 15.x | Transaction history + user data | Backend Dev |
| Cache | Redis 7.x | Rate caching + session management | Backend Dev |
| Monitoring | Prometheus + Grafana | System health + alerts | Tech Lead |

---

## 2. SMART CONTRACT DESIGN

### 2.1 Contract Structure

```rust
// File: smart-contracts/contracts/remiflow/src/lib.rs

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracterror, contracttype, 
    Address, Vec, String, Symbol, Env, BytesN, Val
};

#[contract]
pub struct RemitFlowContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Anchor {
    pub id: String,
    pub address: Address,
    pub name: String,
    pub supported_currencies: Vec<Symbol>,
    pub supported_countries: Vec<String>,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AnchorRate {
    pub anchor_id: String,
    pub fee_percent: i128,
    pub fx_rate: i128,
    pub last_updated: u64,
    pub min_amount: i128,
    pub max_amount: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RouteRequest {
    pub amount: i128,
    pub from_currency: Symbol,
    pub to_currency: Symbol,
    pub destination_country: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Transaction {
    pub id: BytesN<32>,
    pub user: Address,
    pub anchor_id: String,
    pub amount: i128,
    pub fee: i128,
    pub status: Symbol,
    pub created_at: u64,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    Unauthorized = 1,
    AnchorNotFound = 2,
    NoRoutesAvailable = 3,
    InsufficientLiquidity = 4,
    AmountOutOfRange = 5,
    ContractPaused = 6,
    OracleStale = 7,
    TransactionFailed = 8,
}

#[contractimpl]
impl RemitFlowContract {
    /// Initialize contract with admin address
    pub fn initialize(e: &Env, admin: Address, oracle: Address) {
        // Store admin and oracle addresses
        // Set contract as unpaused
    }
    
    /// Register anchor for routing (admin only)
    pub fn register_anchor(
        e: &Env, 
        admin: Address, 
        anchor: Anchor
    ) -> Result<(), Error> {
        // Verify admin authorization
        // Store anchor record
        // Emit registration event
    }
    
    /// Update anchor rates (oracle only)
    pub fn update_anchor_rates(
        e: &Env, 
        oracle: Address, 
        anchor_id: String, 
        rate: AnchorRate
    ) -> Result<(), Error> {
        // Verify oracle authorization
        // Update anchor rates
        // Emit rate update event
    }
    
    /// Find best route for given request
    pub fn find_best_route(
        e: &Env, 
        request: RouteRequest
    ) -> Result<AnchorRate, Error> {
        // Fetch all active anchors
        // Filter by currency pair + country
        // Calculate total cost (fee + FX spread)
        // Return best route
    }
    
    /// Execute payment through selected anchor
    pub fn execute_payment(
        e: &Env, 
        user: Address, 
        anchor_id: String,
        amount: i128
    ) -> Result<Transaction, Error> {
        // Verify user authorization
        // Verify contract not paused
        // Transfer funds to anchor
        // Create transaction record
        // Emit transaction event
    }
    
    /// Get transaction status
    pub fn get_transaction(
        e: &Env, 
        tx_id: BytesN<32>
    ) -> Result<Transaction, Error> {
        // Fetch transaction from storage
        // Return transaction details
    }
    
    /// Emergency pause (admin only)
    pub fn pause_contract(e: &Env, admin: Address) -> Result<(), Error> {
        // Verify admin authorization
        // Set contract paused state
    }
    
    /// Unpause contract (admin only)
    pub fn unpause_contract(e: &Env, admin: Address) -> Result<(), Error> {
        // Verify admin authorization
        // Set contract unpaused state
    }
}
```

### 2.2 Contract Storage Schema

| Storage Key | Type | Description | TTL |
|-------------|------|-------------|-----|
| `ADMIN` | Address | Contract admin address | Permanent |
| `ORACLE` | Address | Oracle service address | Permanent |
| `PAUSED` | bool | Contract pause state | Permanent |
| `ANCHOR:{id}` | Anchor | Anchor registration data | Permanent |
| `RATE:{id}` | AnchorRate | Current anchor rates | 24 hours |
| `TX:{id}` | Transaction | Transaction record | Permanent |
| `USER_TX:{user}` | Vec\<BytesN<32>\> | User's transaction history | Permanent |

### 2.3 Event Schema

| Event Name | Data Fields | Purpose |
|------------|-------------|---------|
| `anchor_registered` | anchor_id, anchor_address | Track anchor onboarding |
| `rate_updated` | anchor_id, fee, fx_rate, timestamp | Track rate changes |
| `payment_initiated` | tx_id, user, anchor_id, amount | Track payment start |
| `payment_completed` | tx_id, status, final_amount | Track payment completion |
| `contract_paused` | admin, timestamp | Track pause events |
| `contract_unpaused` | admin, timestamp | Track unpause events |

---

## 3. BACKEND API DESIGN

### 3.1 API Endpoints

#### Authentication
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/challenge` | POST | Get SEP-10 challenge | No |
| `/auth/verify` | POST | Verify SEP-10 signature | No |
| `/auth/refresh` | POST | Refresh JWT token | Yes |

#### Rates
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/rates` | GET | Get current rates from all anchors | No |
| `/rates/best` | POST | Get best route for amount | No |
| `/rates/history` | GET | Get historical rate data | Yes |

#### Transactions
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/transactions` | POST | Create new transaction | Yes |
| `/transactions` | GET | Get user's transactions | Yes |
| `/transactions/{id}` | GET | Get transaction details | Yes |
| `/transactions/{id}/status` | GET | Get real-time status | Yes |

#### Anchors (Admin)
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/anchors` | GET | List all anchors | Admin |
| `/anchors` | POST | Register new anchor | Admin |
| `/anchors/{id}` | PUT | Update anchor info | Admin |
| `/anchors/{id}/rates` | PUT | Update anchor rates | Oracle |

### 3.2 API Request/Response Examples

#### Get Best Route
```json
// POST /rates/best
// Request:
{
    "amount": 500000000,
    "from_currency": "USDC",
    "to_currency": "COP",
    "destination_country": "CO"
}

// Response:
{
    "success": true,
    "data": {
        "anchor_id": "anchor_colombia_1",
        "anchor_name": "Colombia Anchor",
        "fee_percent": 150,
        "fx_rate": 425000,
        "total_cost": 500750000,
        "estimated_arrival": "2026-01-15T10:30:00Z",
        "savings_vs_average": 3.2
    }
}
```

#### Create Transaction
```json
// POST /transactions
// Request:
{
    "anchor_id": "anchor_colombia_1",
    "amount": 500000000,
    "recipient_address": "G...recipient",
    "recipient_info": {
        "name": "Carlos R.",
        "id_type": "passport",
        "id_number": "AB123456"
    }
}

// Response:
{
    "success": true,
    "data": {
        "transaction_id": "tx_abc123...",
        "stellar_tx_hash": "hash_xyz789...",
        "status": "pending",
        "estimated_completion": "2026-01-15T10:35:00Z"
    }
}
```

---

## 4. ORACLE SERVICE DESIGN

### 4.1 Oracle Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      ORACLE SERVICE FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Anchor A  │───▶│             │    │             │         │
│  │   API       │    │             │    │             │         │
│  └─────────────┘    │             │    │             │         │
│                     │   Rate      │    │   Soroban   │         │
│  ┌─────────────┐    │   Fetcher   │───▶│   Contract  │         │
│  │   Anchor B  │───▶│   Service   │    │             │         │
│  │   API       │    │  (Node.js)  │    │             │         │
│  └─────────────┘    │             │    │             │         │
│                     │             │    │             │         │
│  ┌─────────────┐    │             │    │             │         │
│  │   Anchor C  │───▶│             │    │             │         │
│  │   API       │    │             │    │             │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Redis     │    │ Prometheus  │    │   Alerting  │         │
│  │   (Cache)   │    │ (Monitoring)│    │  (PagerDuty)│         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Oracle Implementation

```javascript
// File: services/oracle/rateFetcher.js

const axios = require('axios');
const Redis = require('ioredis');
const { SorobanRpc, TransactionBuilder } = require('@stellar/stellar-sdk');

class RateOracle {
    constructor(config) {
        this.sorobanRpcUrl = config.sorobanRpcUrl;
        this.contractAddress = config.contractAddress;
        this.oracleSecret = config.oracleSecret;
        this.anchors = config.anchors;
        this.redis = new Redis(config.redisUrl);
        this.server = new SorobanRpc.Server(config.sorobanRpcUrl);
    }
    
    // Fetch rates from all anchors
    async fetchAllRates() {
        const rates = [];
        
        for (const anchor of this.anchors) {
            try {
                const [feeData, quoteData] = await Promise.all([
                    this.fetchAnchorFee(anchor),
                    this.fetchAnchorQuote(anchor)
                ]);
                
                const rate = {
                    anchorId: anchor.id,
                    feePercent: this.parseFee(feeData.fee),
                    fxRate: this.parseRate(quoteData.rate),
                    lastUpdated: Date.now(),
                    minAmount: anchor.minAmount,
                    maxAmount: anchor.maxAmount
                };
                
                rates.push(rate);
                
                // Cache for 5 minutes
                await this.redis.setex(
                    `rate:${anchor.id}`,
                    300,
                    JSON.stringify(rate)
                );
                
                console.log(`Fetched rates for ${anchor.id}`);
            } catch (error) {
                console.error(`Failed to fetch rates for ${anchor.id}:`, error);
            }
        }
        
        return rates;
    }
    
    // Fetch anchor fee structure
    async fetchAnchorFee(anchor) {
        const response = await axios.get(`${anchor.baseUrl}/fee`, {
            params: { 
                amount: 1000, 
                asset_code: 'USDC',
                asset_issuer: anchor.usdcIssuer
            },
            headers: { 
                Authorization: `Bearer ${anchor.authToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        return response.data;
    }
    
    // Fetch anchor FX quote
    async fetchAnchorQuote(anchor) {
        const response = await axios.get(`${anchor.baseUrl}/quotes`, {
            params: { 
                source_asset: 'USDC',
                destination_asset: anchor.localCurrency
            },
            headers: { 
                Authorization: `Bearer ${anchor.authToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        return response.data;
    }
    
    // Update Soroban contract with new rates
    async updateContractRates(rates) {
        for (const rate of rates) {
            try {
                // Build Soroban transaction
                const tx = await this.buildRateUpdateTransaction(rate);
                
                // Sign and submit
                const result = await this.submitTransaction(tx);
                
                console.log(`Updated rates for ${rate.anchorId}:`, result);
            } catch (error) {
                console.error(`Failed to update rates for ${rate.anchorId}:`, error);
            }
        }
    }
    
    // Build rate update transaction
    async buildRateUpdateTransaction(rate) {
        const account = await this.server.getAccount(this.oraclePublicKey);
        
        const tx = new TransactionBuilder(account, {
            fee: await this.server.getLatestFee(),
            networkPassphrase: 'Test SDF Network ; September 2015'
        })
        .addOperation(
            SorobanRpc.Operation.invokeContractFunction({
                contract: this.contractAddress,
                function: 'update_anchor_rates',
                args: [
                    rate.anchorId,
                    rate.feePercent,
                    rate.fxRate
                ]
            })
        )
        .setTimeout(30)
        .build();
        
        return tx;
    }
    
    // Submit transaction to network
    async submitTransaction(tx) {
        // Sign transaction
        tx.sign(this.oracleKeypair);
        
        // Prepare transaction
        const prepared = await this.server.prepareTransaction(tx);
        
        // Submit transaction
        const result = await this.server.sendTransaction(prepared);
        
        return result;
    }
    
    // Start scheduled rate updates (every 5 minutes)
    startScheduledUpdates() {
        const cron = require('node-cron');
        
        cron.schedule('*/5 * * * *', async () => {
            console.log('Fetching anchor rates...');
            const rates = await this.fetchAllRates();
            await this.updateContractRates(rates);
            console.log('Rates updated successfully');
        });
        
        console.log('Oracle scheduled updates started');
    }
}

module.exports = { RateOracle };
```

### 4.3 Oracle Monitoring

| Metric | Threshold | Alert Level | Action |
|--------|-----------|-------------|--------|
| Rate fetch failure rate | >10% | Warning | Check anchor API health |
| Rate fetch failure rate | >50% | Critical | Pause contract, investigate |
| Rate staleness | >10 minutes | Warning | Check oracle service |
| Rate staleness | >30 minutes | Critical | Pause contract, investigate |
| Contract update failure | >5% | Warning | Check RPC endpoint |
| Contract update failure | >20% | Critical | Check oracle keys + funds |

---

## 5. DATABASE SCHEMA

### 5.1 PostgreSQL Schema

```sql
-- File: database/schema.sql

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stellar_address VARCHAR(56) UNIQUE NOT NULL,
    email VARCHAR(255),
    kyc_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Anchors table
CREATE TABLE anchors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    stellar_address VARCHAR(56) NOT NULL,
    base_url VARCHAR(255) NOT NULL,
    auth_token VARCHAR(255) NOT NULL,
    supported_currencies TEXT[] NOT NULL,
    supported_countries TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rates table (cached from oracle)
CREATE TABLE rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anchor_id VARCHAR(50) REFERENCES anchors(id),
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    fee_percent NUMERIC(10, 4) NOT NULL,
    fx_rate NUMERIC(20, 8) NOT NULL,
    min_amount BIGINT NOT NULL,
    max_amount BIGINT NOT NULL,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stellar_tx_hash VARCHAR(64) UNIQUE,
    user_id UUID REFERENCES users(id),
    anchor_id VARCHAR(50) REFERENCES anchors(id),
    amount BIGINT NOT NULL,
    fee BIGINT NOT NULL,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    recipient_address VARCHAR(56),
    recipient_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Anchor revenue share table
CREATE TABLE anchor_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anchor_id VARCHAR(50) REFERENCES anchors(id),
    transaction_id UUID REFERENCES transactions(id),
    revenue_amount BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    target VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_stellar_address ON users(stellar_address);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_rates_anchor_id ON rates(anchor_id);
CREATE INDEX idx_rates_expires_at ON rates(expires_at);
```

---

## 6. SECURITY DESIGN

### 6.1 Security Controls

| Layer | Control | Implementation |
|-------|---------|----------------|
| Smart Contract | Multi-sig admin | 2-of-3 admin addresses |
| Smart Contract | Emergency pause | Admin-controlled pause function |
| Smart Contract | Rate staleness check | Reject rates older than 30 minutes |
| API | Authentication | JWT + SEP-10 tokens |
| API | Rate limiting | 100 requests/minute per IP |
| API | Input validation | Zod schema validation |
| Database | Encryption | AES-256 at rest |
| Database | Access control | Role-based permissions |
| Infrastructure | WAF | Cloudflare protection |
| Infrastructure | DDoS protection | Cloudflare + AWS Shield |

### 6.2 Smart Contract Security Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Reentrancy protection | Not Started | Use Soroban's built-in protection |
| Overflow/underflow | Not Started | Use i128 for all amounts |
| Access control | Not Started | Admin-only functions verified |
| Event logging | Not Started | All state changes emit events |
| Emergency pause | Not Started | Pause function implemented |
| Third-party audit | Not Started | Budgeted $10K for audit |

---

## 7. DEPLOYMENT ARCHITECTURE

### 7.1 Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION INFRASTRUCTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Cloudflare │───▶│   AWS ALB   │───▶│   EKS       │         │
│  │  (CDN+WAF)  │    │  (Load Bal) │    │  (K8s)      │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                              │                  │                │
│                              ▼                  ▼                │
│                       ┌─────────────┐    ┌─────────────┐        │
│                       │   RDS       │    │  ElastiCache│        │
│                       │ (PostgreSQL)│    │   (Redis)   │        │
│                       └─────────────┘    └─────────────┘        │
│                              │                  │                │
│                              ▼                  ▼                │
│                       ┌─────────────┐    ┌─────────────┐        │
│                       │  Backups    │    │ Monitoring  │        │
│                       │  (S3)       │    │ (Grafana)   │        │
│                       └─────────────┘    └─────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Deployment Checklist

| Environment | Components | Status |
|-------------|------------|--------|
| Development | Local + testnet | Not Started |
| Staging | Testnet + staging DB | Not Started |
| Production | Mainnet + production DB | Not Started |

---

## 8. TESTING STRATEGY

### 8.1 Test Coverage Requirements

| Component | Minimum Coverage | Tool |
|-----------|-----------------|------|
| Smart Contract | 90% | Soroban Test Framework |
| Backend API | 80% | Jest |
| Frontend | 70% | React Testing Library |
| Oracle Service | 85% | Jest |

### 8.2 Test Types

| Test Type | Frequency | Owner |
|-----------|-----------|-------|
| Unit tests | Every commit | Developers |
| Integration tests | Every PR | QA |
| End-to-end tests | Weekly | QA |
| Security tests | Before mainnet | Third-party |
| Performance tests | Monthly | Tech Lead |

---

**Document Approval:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Tech Lead | | | |
| Smart Contract Dev | | | |
| Security Lead | | | |
