use soroban_sdk::{contracttype, vec, Address, Env, String, Symbol, Vec};

use crate::admin::require_not_paused;
use crate::events;
use crate::routing::{self, BestRoute, RouteRequest};

/// Status values for a remittance transaction.
pub mod status {
    #![allow(dead_code)]
    use soroban_sdk::{symbol_short, Symbol};

    pub const fn pending() -> Symbol { symbol_short!("pending") }
    pub const fn processing() -> Symbol { symbol_short!("process") }
    pub const fn completed() -> Symbol { symbol_short!("complete") }
    pub const fn failed() -> Symbol { symbol_short!("failed") }
}

/// A record of a single remittance transaction.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Transaction {
    /// Auto-incremented transaction ID.
    pub id: u64,
    /// User who initiated the payment.
    pub user: Address,
    /// Anchor through which the payment is routed.
    pub anchor_id: String,
    /// Amount sent by the user (in stroops / smallest unit).
    pub amount: i128,
    /// Fee charged (in stroops).
    pub fee: i128,
    /// Destination currency symbol.
    pub to_currency: Symbol,
    /// Destination country code.
    pub destination_country: String,
    /// Current status of the transaction.
    pub status: Symbol,
    /// Ledger sequence when the transaction was created.
    pub created_at: u32,
}

/// Counter key for the auto-increment transaction ID.
const TX_COUNTER_KEY: &str = "TXCOUNTER";

/// Result returned after initiating a payment.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentResult {
    /// The created transaction record.
    pub transaction: Transaction,
    /// Details of the selected route.
    pub route: BestRoute,
}

/// Initiate a payment by finding the best route and recording the transaction.
///
/// The user must authorize this call. The contract must not be paused.
pub fn initiate_payment(
    env: &Env,
    user: Address,
    request: RouteRequest,
) -> PaymentResult {
    user.require_auth();
    require_not_paused(env);

    // Find the best available route.
    let route = routing::find_best_route(env, &request)
        .expect("no suitable route found");

    // Generate a new transaction ID.
    let tx_id = next_tx_id(env);

    let tx = Transaction {
        id: tx_id,
        user: user.clone(),
        anchor_id: route.rate.anchor_id.clone(),
        amount: request.amount,
        fee: route.fee,
        to_currency: request.to_currency,
        destination_country: request.destination_country.clone(),
        status: status::pending(),
        created_at: env.ledger().sequence(),
    };

    // Store the transaction.
    store_transaction(env, &tx, &user);

    // Emit the event.
    events::emit_payment_initiated(
        env,
        tx_id,
        user,
        route.rate.anchor_id.clone(),
        request.amount,
        route.fee,
    );

    PaymentResult {
        transaction: tx,
        route,
    }
}

/// Update the status of an existing transaction. Oracle only.
pub fn update_transaction_status(
    env: &Env,
    tx_id: u64,
    new_status: Symbol,
) {
    crate::admin::require_oracle(env);

    let mut tx: Transaction = env
        .storage()
        .persistent()
        .get(&TxDataKey::Tx(tx_id))
        .expect("transaction not found");

    tx.status = new_status;
    env.storage()
        .persistent()
        .set(&TxDataKey::Tx(tx_id), &tx);
}

/// Retrieve a transaction by its ID.
pub fn get_transaction(env: &Env, tx_id: u64) -> Option<Transaction> {
    env.storage().persistent().get(&TxDataKey::Tx(tx_id))
}

/// Retrieve all transaction IDs for a given user.
pub fn get_user_transactions(env: &Env, user: &Address) -> Vec<u64> {
    env.storage()
        .persistent()
        .get(user)
        .unwrap_or_else(|| vec![env])
}

// ─── Internal helpers ───────────────────────────────────────────────────────

/// Storage key for transaction records.
#[contracttype]
enum TxDataKey {
    Tx(u64),
}

fn next_tx_id(env: &Env) -> u64 {
    let current: u64 = env.storage().instance().get(&TX_COUNTER_KEY).unwrap_or(0);
    let next = current + 1;
    env.storage().instance().set(&TX_COUNTER_KEY, &next);
    next
}

fn store_transaction(env: &Env, tx: &Transaction, user: &Address) {
    // Store by tx_id using the enum key.
    env.storage()
        .persistent()
        .set(&TxDataKey::Tx(tx.id), tx);

    // Append tx_id to the user's transaction list (keyed by Address directly).
    let mut tx_ids: Vec<u64> = env
        .storage()
        .persistent()
        .get(user)
        .unwrap_or_else(|| vec![env]);

    tx_ids.push_back(tx.id);
    env.storage().persistent().set(user, &tx_ids);
}
