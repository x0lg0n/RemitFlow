# RemitFlow Smart Contract 🚀

**Soroban smart contract for cross-border payment routing on Stellar**

[![Stellar](https://img.shields.io/badge/Built%20on-Stellar-blue)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-purple)](https://soroban.stellar.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Overview

The RemitFlow smart contract is a Soroban (Rust) contract deployed on Stellar's testnet that:
- Stores and manages supported anchors
- Maintains real-time exchange rates
- Routes payments through the cheapest anchor pair
- Emits events for transaction tracking
- Enforces admin controls and security checks

**Contract Address (Testnet):**  
`CAN4U3NRPWV7IPDUSKWAYMTHWNSFH4ZRJGA7KMEDKLYJCJCCJNV6TXF7`

**Explorer Links:**
- [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAN4U3NRPWV7IPDUSKWAYMTHWNSFH4ZRJGA7KMEDKLYJCJCCJNV6TXF7)
- [Stellar Lab](https://lab.stellar.org/r/testnet/contract/CAN4U3NRPWV7IPDUSKWAYMTHWNSFH4ZRJGA7KMEDKLYJCJCCJNV6TXF7)

---

## Project Structure

```
smart-contracts/
├── contracts/
│   └── remitflow/
│       ├── src/
│       │   ├── lib.rs              # Contract entry points & main logic
│       │   ├── types.rs            # Contract types & structs
│       │   ├── errors.rs           # Error definitions
│       │   ├── events.rs           # Event emissions
│       │   ├── storage.rs          # Storage management & TTL
│       │   ├── auth.rs             # Authorization checks
│       │   ├── rates.rs            # Rate comparison logic
│       │   └── test.rs             # Contract tests
│       ├── Cargo.toml
│       └── Cargo.lock
├── Cargo.toml                      # Workspace root
├── target/                         # Build output
│   └── wasm32v1-none/
│       ├── release/
│       │   └── remiflow.wasm       # Compiled contract binary
│       └── debug/
└── README.md                       # This file
```

---

## Key Features

### 1. Anchor Management
- Register new anchors (admin only)
- Enable/disable anchors
- Store anchor metadata (name, URL, supported currencies)
- Manage anchor credentials securely

### 2. Rate Management
- Publish real-time exchange rates
- Automatic TTL management (24-hour expiry)
- Rate validation (deviation checks)
- Multi-source rate aggregation

### 3. Payment Routing
- Compare rates across all active anchors
- Find optimal route for lowest cost
- Support for multiple currency pairs
- Transaction fee calculation

### 4. Security
- Admin authorization for state changes
- SEP-10 wallet verification
- Contract pause/emergency stop
- Parameterized storage (no injection attacks)

### 5. Events
- `AnchorRegistered` - New anchor added
- `RatePublished` - Rate update
- `RouteSelected` - Payment routed
- `PaymentCompleted` - Transaction finalized

---

## Building

### Prerequisites
```bash
# Install Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Soroban target
rustup target add wasm32v1-none

# Install Stellar CLI
curl -sSfL https://github.com/stellar/go/releases/download/stellar-22.3.0/stellar-22.3.0-linux-amd64.tar.gz | tar -xz
sudo mv stellar /usr/local/bin/
```

### Build Contract
```bash
cd smart-contracts

# Debug build
cargo build --target wasm32v1-none

# Release build (optimized, ~22KB)
cargo build --release --target wasm32v1-none
```

### Verify Build
```bash
# Check WASM binary
ls -lh target/wasm32v1-none/release/remiflow.wasm
# Output: -rw-r--r-- 22K remiflow.wasm

# Inspect contract
stellar contract info \
  --id CAN4U3NRPWV7IPDUSKWAYMTHWNSFH4ZRJGA7KMEDKLYJCJCCJNV6TXF7 \
  --network testnet
```

---

## Testing

### Run All Tests
```bash
cd smart-contracts
cargo test --release
```

### Test Coverage
```bash
# Generate coverage report (requires cargo-tarpaulin)
cargo install cargo-tarpaulin
cargo tarpaulin --out Html --target wasm32v1-none
```

### Key Test Cases
- ✅ Anchor registration (admin only)
- ✅ Rate publication with validation
- ✅ Route selection optimization
- ✅ Authorization checks
- ✅ Error handling
- ✅ Storage TTL management
- ✅ State mutation safety

**Target Coverage:** 90%+

---

## Deployment

### Deploy to Testnet
```bash
# Build release binary
cargo build --release --target wasm32v1-none

# Deploy using Stellar CLI
stellar contract deploy \
  --wasm target/wasm32v1-none/release/remiflow.wasm \
  --source-account remitflow \
  --network testnet \
  --alias remitflow
```

---

## Contract Interface

### Admin Functions

#### `register_anchor(anchor: Anchor) -> Result<(), Error>`
Register a new anchor for payments. Admin only.

```rust
#[derive(Contracttype)]
pub struct Anchor {
    pub id: String,
    pub name: String,
    pub stellar_address: String,
    pub base_url: String,
    pub supported_currencies: Vec<String>,
    pub supported_countries: Vec<String>,
    pub fee_percent: i128,
    pub is_active: bool,
}
```

#### `pause() -> Result<(), Error>`
Emergency pause contract. Admin only.

#### `unpause() -> Result<(), Error>`
Resume contract operations. Admin only.

---

### Public Functions

#### `find_best_route(from_currency: String, to_currency: String, amount: i128) -> Result<Route, Error>`
Find the cheapest payment route.

```rust
#[derive(Contracttype)]
pub struct Route {
    pub source_anchor: String,
    pub destination_anchor: String,
    pub source_currency: String,
    pub destination_currency: String,
    pub source_amount: i128,
    pub destination_amount: i128,
    pub total_fee: i128,
}
```

#### `get_rate(anchor_id: String, currency_pair: String) -> Result<Rate, Error>`
Get current rate for an anchor.

```rust
#[derive(Contracttype)]
pub struct Rate {
    pub anchor_id: String,
    pub currency_pair: String,
    pub buy_rate: i128,
    pub sell_rate: i128,
    pub timestamp: u64,
}
```

---

## Storage Schema

### Anchors
```
Key: `a:{anchor_id}` 
Value: Anchor struct
TTL: Permanent (no expiry)
```

### Rates
```
Key: `r:{anchor_id}:{currency_pair}`
Value: Rate struct
TTL: 24 hours (1,440 minutes)
```

### Admin
```
Key: `admin`
Value: Address
TTL: Permanent
```

### Pause Status
```
Key: `paused`
Value: bool
TTL: Permanent
```

---

## Error Handling

All functions return `Result<T, Error>` with proper error types:

```rust
pub enum Error {
    Unauthorized,           // Not authorized
    AnchorNotFound,        // Anchor doesn't exist
    RateNotFound,          // Rate data unavailable
    RateStale,             // Rate older than 30 minutes
    InvalidInput,          // Invalid parameters
    ContractPaused,        // Contract is paused
    DeviationTooHigh,      // Rate deviation > threshold
    InsufficientLiquidity, // Not enough liquidity
}
```

---

## Security Considerations

### ✅ Implemented
- Parameterized storage (no injection attacks)
- Admin authorization checks
- Rate staleness validation
- Emergency pause mechanism
- Bounded storage TTL
- Type-safe Rust implementation
- No unchecked arithmetic (i128)

### 🔒 Best Practices
- Never trust untrusted input
- Always call `require_auth()` on state changes
- Use typed errors, not panic!()
- Emit events for all state changes
- Regular security audits
- Public code review

### ⚠️ Limitations
- One admin account (upgrade path needed for multi-sig)
- Manual rate updates (upgrade to oracle feeds)
- No liquidation mechanism
- Limited to Stellar ecosystem

---

## Upgrading the Contract

### Procedure
1. Develop new contract version
2. Run full test suite
3. Deploy to testnet
4. Get community feedback
5. Audit new version
6. Publish on mainnet
7. Migrate state (if schema changes)

**Note:** Current contract has no upgrade mechanism. Create new instance to upgrade.

---

## Monitoring

### Track Contract Activity
```bash
# View all contract invocations
stellar contract info \
  --id CAN4U3NRPWV7IPDUSKWAYMTHWNSFH4ZRJGA7KMEDKLYJCJCCJNV6TXF7 \
  --network testnet \
  --show-details

# Monitor events
stellar events contract \
  --contract-id CAN4U3NRPWV7IPDUSKWAYMTHWNSFH4ZRJGA7KMEDKLYJCJCCJNV6TXF7 \
  --network testnet \
  --follow
```

### Metrics to Track
- Total routes evaluated
- Average gas cost per transaction
- Rate update frequency
- Error rates by type
- Anchor participation

---

## Contributing

See [../CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

### Development Rules
- Follow [../AGENTS.md 5.1](../AGENTS.md#51-smart-contracts-rust--soroban) coding standards
- Minimum 90% test coverage
- All functions documented with doc comments
- Use parameterized queries (already done)
- Never use `panic!()` — return `Error`
- Emit events for all state changes

---

## References

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Documentation](https://developers.stellar.org/docs)
- [SEP-31 Cross-Border Payments](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0031.md)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [Stellar Expert](https://stellar.expert)

---

## License

MIT License - see [../LICENSE](../LICENSE) for details
