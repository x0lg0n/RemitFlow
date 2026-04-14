use soroban_sdk::{contracttype, Env, String};

use crate::admin::require_oracle;
use crate::events;

/// Rate data for a single anchor.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AnchorRate {
    /// Anchor identifier matching the registered anchor ID.
    pub anchor_id: String,
    /// Fee expressed in basis points (1 bp = 0.01%, so 150 = 1.50%).
    pub fee_bps: u32,
    /// FX rate in scaled integer form (e.g. 425000 = 1 USDC = 4250.00 local units).
    pub fx_rate: i128,
    /// Ledger sequence when this rate was last updated.
    pub last_updated: u32,
    /// Minimum remittance amount accepted by this anchor.
    pub min_amount: i128,
    /// Maximum remittance amount accepted by this anchor.
    pub max_amount: i128,
    /// Source currency code (e.g. "USDC").
    pub from_currency: String,
    /// Destination currency code (e.g. "COP").
    pub to_currency: String,
}

/// Key for the maximum allowed staleness in ledger sequences.
/// 30 minutes ≈ 360 ledgers (5s per ledger).
const MAX_STALENESS: u32 = 360;

/// Update an anchor's rate. Oracle only.
pub fn update_anchor_rate(env: &Env, rate: &AnchorRate) {
    require_oracle(env);

    let key = rate_key(env, &rate.anchor_id);
    env.storage().persistent().set(&key, rate);

    // Extend TTL to keep the rate accessible for the next MAX_STALENESS ledgers.
    env.storage()
        .persistent()
        .extend_ttl(&key, MAX_STALENESS / 2, MAX_STALENESS);

    events::emit_rate_updated(
        env,
        rate.anchor_id.clone(),
        rate.fee_bps,
        rate.fx_rate,
        rate.last_updated,
    );
}

/// Retrieve the current rate for a specific anchor.
/// Returns None if no rate has been stored or if the rate is stale.
pub fn get_anchor_rate(env: &Env, anchor_id: &String) -> Option<AnchorRate> {
    let key = rate_key(env, anchor_id);

    let rate: AnchorRate = match env.storage().persistent().get(&key) {
        Some(r) => r,
        None => return None,
    };

    // Reject stale rates.
    let current_ledger = env.ledger().sequence();
    if current_ledger.saturating_sub(rate.last_updated) > MAX_STALENESS {
        return None;
    }

    Some(rate)
}

// ─── Internal helpers ───────────────────────────────────────────────────────

/// Storage key for rate records — uses a tuple (prefix, anchor_id).
#[contracttype]
enum RateDataKey {
    Rate(String),
}

fn rate_key(_env: &Env, anchor_id: &String) -> RateDataKey {
    RateDataKey::Rate(anchor_id.clone())
}
