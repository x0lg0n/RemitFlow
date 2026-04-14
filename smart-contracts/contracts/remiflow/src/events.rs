use soroban_sdk::{contractevent, Address, Env, String};

/// Event emitted when an anchor is registered.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AnchorRegistered {
    pub anchor_id: String,
    pub anchor_name: String,
    pub admin: Address,
}

/// Event emitted when an anchor's rates are updated.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RateUpdated {
    pub anchor_id: String,
    pub fee_bps: u32,
    pub fx_rate: i128,
    pub updated_at: u32,
}

/// Event emitted when a payment is initiated.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentInitiated {
    pub tx_id: u64,
    pub user: Address,
    pub anchor_id: String,
    pub amount: i128,
    pub fee: i128,
}

/// Event emitted when the contract is paused or unpaused.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractStatusChanged {
    pub paused: bool,
    pub admin: Address,
    pub timestamp: u32,
}

/// Publish an anchor-registered event.
pub fn emit_anchor_registered(env: &Env, anchor_id: String, anchor_name: String, admin: Address) {
    let event = AnchorRegistered {
        anchor_id,
        anchor_name,
        admin,
    };
    AnchorRegistered::publish(&event, env);
}

/// Publish a rate-updated event.
pub fn emit_rate_updated(env: &Env, anchor_id: String, fee_bps: u32, fx_rate: i128, updated_at: u32) {
    let event = RateUpdated {
        anchor_id,
        fee_bps,
        fx_rate,
        updated_at,
    };
    RateUpdated::publish(&event, env);
}

/// Publish a payment-initiated event.
pub fn emit_payment_initiated(
    env: &Env,
    tx_id: u64,
    user: Address,
    anchor_id: String,
    amount: i128,
    fee: i128,
) {
    let event = PaymentInitiated {
        tx_id,
        user,
        anchor_id,
        amount,
        fee,
    };
    PaymentInitiated::publish(&event, env);
}

/// Publish a contract-status-changed event.
pub fn emit_contract_status_changed(env: &Env, paused: bool, admin: Address, timestamp: u32) {
    let event = ContractStatusChanged {
        paused,
        admin,
        timestamp,
    };
    ContractStatusChanged::publish(&event, env);
}
