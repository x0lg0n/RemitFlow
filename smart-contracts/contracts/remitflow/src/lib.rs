#![no_std]

/// RemitFlow — Soroban smart contract for cross-border remittance routing.
///
/// Aggregates multiple Stellar anchors (SEP-31), compares their fees and FX
/// rates in real-time, and automatically selects the cheapest route for
/// each remittance payment.
///
/// # Modules
/// * `admin`    — Admin/oracle authorization, pause controls
/// * `anchor`   — Anchor registration and management
/// * `rates`    — Anchor rate storage and staleness validation
/// * `routing`  — Route optimization logic
/// * `payment`  — Payment initiation and transaction tracking
/// * `events`   — Event emission helpers
/// * `test`     — Co-located test suite
mod admin;
mod anchor;
mod events;
mod payment;
mod rates;
mod routing;

#[cfg(test)]
mod test;

use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol, Vec};

// ─── Re-export public types so callers can use them directly ────────────────
pub use anchor::Anchor;
pub use rates::AnchorRate;
pub use routing::{BestRoute, RouteRequest};
pub use payment::{Transaction, PaymentResult};

/// Error types returned by the contract.
#[repr(u32)]
pub enum Error {
    NoRouteFound = 1,
    AnchorNotFound = 2,
    TransactionNotFound = 3,
    ContractPaused = 4,
    Unauthorized = 5,
}

/// The RemitFlow contract entry point.
#[contract]
pub struct RemitFlowContract;

#[contractimpl]
impl RemitFlowContract {
    // ─── Initialization ─────────────────────────────────────────────────

    /// Initialize the contract with admin and oracle addresses.
    ///
    /// # Arguments
    /// * `e` — Soroban environment
    /// * `admin` — Admin address (controls anchor registration, pause)
    /// * `oracle` — Oracle address (updates anchor rates)
    ///
    /// # Errors
    /// * Panics if called more than once (admin already set)
    pub fn initialize(e: Env, admin: Address, oracle: Address) {
        if admin::get_admin(&e).is_some() {
            panic!("already initialized");
        }
        admin::set_admin(&e, &admin);
        admin::set_oracle(&e, &oracle);
    }

    // ─── Anchor Management ──────────────────────────────────────────────

    /// Register a new anchor for routing. Admin only.
    ///
    /// # Arguments
    /// * `e` — Soroban environment
    /// * `anchor` — Complete anchor data to store
    pub fn register_anchor(e: Env, anchor: Anchor) {
        anchor::register_anchor(&e, &anchor);
    }

    /// Toggle the active status of an anchor. Admin only.
    ///
    /// # Arguments
    /// * `e` — Soroban environment
    /// * `anchor_id` — ID of the anchor to update
    /// * `active` — Whether the anchor should be available for routing
    pub fn set_anchor_active(e: Env, anchor_id: String, active: bool) {
        anchor::set_anchor_active(&e, &anchor_id, active);
    }

    /// Get anchor details by ID.
    ///
    /// # Returns
    /// The `Anchor` record, or `None` if not found.
    pub fn get_anchor(e: Env, anchor_id: String) -> Option<Anchor> {
        anchor::get_anchor(&e, &anchor_id)
    }

    /// Get IDs of all anchors that have ever been registered.
    pub fn get_all_anchor_ids(e: Env) -> Vec<String> {
        anchor::get_all_anchor_ids(&e)
    }

    /// Get IDs of anchors currently available for routing.
    pub fn get_active_anchor_ids(e: Env) -> Vec<String> {
        anchor::get_active_anchor_ids(&e)
    }

    // ─── Rate Management ────────────────────────────────────────────────

    /// Update an anchor's rate data. Oracle only.
    ///
    /// # Arguments
    /// * `e` — Soroban environment
    /// * `rate` — Complete rate data for the anchor
    pub fn update_anchor_rate(e: Env, rate: AnchorRate) {
        rates::update_anchor_rate(&e, &rate);
    }

    /// Get the current (non-stale) rate for a specific anchor.
    pub fn get_anchor_rate(e: Env, anchor_id: String) -> Option<AnchorRate> {
        rates::get_anchor_rate(&e, &anchor_id)
    }

    // ─── Routing ────────────────────────────────────────────────────────

    /// Find the cheapest route for a given remittance request.
    ///
    /// # Arguments
    /// * `e` — Soroban environment
    /// * `request` — Amount, currencies, and destination country
    ///
    /// # Returns
    /// The `BestRoute` with lowest fee, or `None` if no anchor qualifies.
    pub fn find_best_route(e: Env, request: RouteRequest) -> Option<BestRoute> {
        routing::find_best_route(&e, &request)
    }

    // ─── Payments ───────────────────────────────────────────────────────

    /// Initiate a payment by selecting the best route and recording it.
    ///
    /// The caller (`user`) must authorize this call. The contract must not
    /// be paused.
    ///
    /// # Arguments
    /// * `e` — Soroban environment
    /// * `user` — Address of the person sending the remittance
    /// * `request` — Remittance details (amount, currencies, country)
    ///
    /// # Errors
    /// * `Error::NoRouteFound` — if no anchor supports the request
    /// * Panics if the contract is paused
    pub fn initiate_payment(e: Env, user: Address, request: RouteRequest) -> PaymentResult {
        payment::initiate_payment(&e, user, request)
    }

    /// Update the status of a transaction. Admin or oracle only.
    ///
    /// # Arguments
    /// * `e` — Soroban environment
    /// * `tx_id` — Transaction ID to update
    /// * `new_status` — New status symbol (e.g. "complete", "failed")
    pub fn update_transaction_status(e: Env, tx_id: u64, new_status: Symbol) {
        payment::update_transaction_status(&e, tx_id, new_status);
    }

    /// Get a transaction by its ID.
    pub fn get_transaction(e: Env, tx_id: u64) -> Option<Transaction> {
        payment::get_transaction(&e, tx_id)
    }

    /// Get all transaction IDs for a given user.
    pub fn get_user_transactions(e: Env, user: Address) -> Vec<u64> {
        payment::get_user_transactions(&e, &user)
    }

    // ─── Admin Controls ─────────────────────────────────────────────────

    /// Pause all payment operations. Admin only.
    pub fn pause(e: Env) {
        admin::pause(&e);
    }

    /// Resume operations after a pause. Admin only.
    pub fn unpause(e: Env) {
        admin::unpause(&e);
    }

    /// Check whether the contract is currently paused.
    pub fn is_paused(e: Env) -> bool {
        admin::is_paused(&e)
    }
}
