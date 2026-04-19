#![cfg(test)]

//! Comprehensive test suite for the RemitFlow Soroban contract.

use crate::{Anchor, AnchorRate, RemitFlowContract, RemitFlowContractClient, RouteRequest};

use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::{vec, Address, Env, String, Symbol};

fn setup() -> (Env, Address, RemitFlowContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RemitFlowContract, ());
    let client = RemitFlowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    client.initialize(&admin, &oracle);

    (env, contract_id, client)
}

fn register_test_anchor(client: &RemitFlowContractClient<'static>, id: &str) {
    let anchor = Anchor {
        id: String::from_str(&client.env, id),
        address: Address::generate(&client.env),
        name: String::from_str(&client.env, id),
        supported_currencies: vec![
            &client.env,
            Symbol::new(&client.env, "USDC"),
            Symbol::new(&client.env, "COP"),
        ],
        supported_countries: vec![&client.env, String::from_str(&client.env, "CO")],
        is_active: true,
    };
    client.register_anchor(&anchor);
}

fn push_rate(client: &RemitFlowContractClient<'static>, anchor_id: &str, fee_bps: u32, fx_rate: i128) {
    let rate = AnchorRate {
        anchor_id: String::from_str(&client.env, anchor_id),
        fee_bps,
        fx_rate,
        last_updated: client.env.ledger().sequence(),
        min_amount: 1_000_000,
        max_amount: 100_000_000,
        from_currency: String::from_str(&client.env, "USDC"),
        to_currency: String::from_str(&client.env, "COP"),
    };
    client.update_anchor_rate(&rate);
}

// ─── Initialization ─────────────────────────────────────────────────────────

#[test]
fn test_initialize_succeeds() {
    let (_env, _id, client) = setup();
    assert!(!client.is_paused());
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_initialize_fails_if_called_twice() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RemitFlowContract, ());
    let client = RemitFlowContractClient::new(&env, &contract_id);

    let admin1 = Address::generate(&env);
    let oracle1 = Address::generate(&env);
    client.initialize(&admin1, &oracle1);

    let admin2 = Address::generate(&env);
    let oracle2 = Address::generate(&env);
    client.initialize(&admin2, &oracle2);
}

// ─── Pause / Unpause ────────────────────────────────────────────────────────

#[test]
fn test_pause_and_unpause() {
    let (_env, _id, client) = setup();

    assert!(!client.is_paused());
    client.pause();
    assert!(client.is_paused());
    client.unpause();
    assert!(!client.is_paused());
}

// ─── Anchor Registration ────────────────────────────────────────────────────

#[test]
fn test_register_anchor_adds_to_list() {
    let (_env, _id, client) = setup();

    register_test_anchor(&client, "co_1");

    let ids = client.get_all_anchor_ids();
    assert_eq!(ids.len(), 1);

    let active = client.get_active_anchor_ids();
    assert_eq!(active.len(), 1);
}

#[test]
fn test_set_anchor_active_filters_from_active_list() {
    let (_env, _id, client) = setup();

    register_test_anchor(&client, "co_1");
    register_test_anchor(&client, "ng_1");

    // Deactivate co_1.
    client.set_anchor_active(&String::from_str(&client.env, "co_1"), &false);

    let active = client.get_active_anchor_ids();
    assert_eq!(active.len(), 1);
}

// ─── Rate Updates ───────────────────────────────────────────────────────────

#[test]
fn test_update_and_retrieve_rate() {
    let (_env, _id, client) = setup();

    register_test_anchor(&client, "co_1");
    push_rate(&client, "co_1", 150, 425_000i128);

    let rate = client
        .get_anchor_rate(&String::from_str(&client.env, "co_1"))
        .expect("rate not found");
    assert_eq!(rate.fee_bps, 150);
    assert_eq!(rate.fx_rate, 425_000i128);
}

#[test]
fn test_stale_rate_returns_none() {
    let (_env, _id, client) = setup();

    register_test_anchor(&client, "co_1");
    push_rate(&client, "co_1", 150, 425_000i128);

    // Advance ledger past MAX_STALENESS (360 ledgers).
    client.env.ledger().set_sequence_number(
        client.env.ledger().sequence() + 400,
    );

    let rate = client.get_anchor_rate(&String::from_str(&client.env, "co_1"));
    assert!(rate.is_none());
}

// ─── Route Optimization ─────────────────────────────────────────────────────

#[test]
fn test_find_best_route_selects_lowest_fee() {
    let (_env, _id, client) = setup();

    // Register two anchors with different fees.
    register_test_anchor(&client, "co_cheap");
    register_test_anchor(&client, "co_expensive");

    // co_cheap charges 100 bps, co_expensive charges 300 bps.
    push_rate(&client, "co_cheap", 100, 425_000i128);
    push_rate(&client, "co_expensive", 300, 425_000i128);

    let request = RouteRequest {
        amount: 10_000_000,
        from_currency: Symbol::new(&client.env, "USDC"),
        to_currency: Symbol::new(&client.env, "COP"),
        destination_country: String::from_str(&client.env, "CO"),
    };

    let best = client.find_best_route(&request).expect("should find a route");
    assert_eq!(best.rate.fee_bps, 100);
}

#[test]
fn test_find_best_route_filters_by_country() {
    let (_env, _id, client) = setup();

    // Register an anchor that supports NG (Nigeria), NOT CO (Colombia).
    let anchor = Anchor {
        id: String::from_str(&client.env, "ng_1"),
        address: Address::generate(&client.env),
        name: String::from_str(&client.env, "ng_1"),
        supported_currencies: vec![
            &client.env,
            Symbol::new(&client.env, "USDC"),
            Symbol::new(&client.env, "NGN"),
        ],
        supported_countries: vec![&client.env, String::from_str(&client.env, "NG")],
        is_active: true,
    };
    client.register_anchor(&anchor);

    push_rate(&client, "ng_1", 100, 800_000i128);

    let request = RouteRequest {
        amount: 10_000_000,
        from_currency: Symbol::new(&client.env, "USDC"),
        to_currency: Symbol::new(&client.env, "NGN"),
        destination_country: String::from_str(&client.env, "CO"),
    };

    let result = client.find_best_route(&request);
    assert!(result.is_none());
}

#[test]
fn test_find_best_route_returns_none_when_no_routes() {
    let (_env, _id, client) = setup();

    // No anchors registered.
    let request = RouteRequest {
        amount: 10_000_000,
        from_currency: Symbol::new(&client.env, "USDC"),
        to_currency: Symbol::new(&client.env, "COP"),
        destination_country: String::from_str(&client.env, "CO"),
    };

    let result = client.find_best_route(&request);
    assert!(result.is_none());
}

// ─── Payments ───────────────────────────────────────────────────────────────

#[test]
fn test_initiate_payment_succeeds() {
    let (_env, _id, client) = setup();
    let user = Address::generate(&client.env);

    register_test_anchor(&client, "co_1");
    push_rate(&client, "co_1", 150, 425_000i128);

    let request = RouteRequest {
        amount: 10_000_000,
        from_currency: Symbol::new(&client.env, "USDC"),
        to_currency: Symbol::new(&client.env, "COP"),
        destination_country: String::from_str(&client.env, "CO"),
    };

    let result = client.initiate_payment(&user, &request);
    assert_eq!(result.transaction.amount, 10_000_000);
    assert_eq!(result.route.rate.fee_bps, 150);
}

#[test]
#[should_panic(expected = "contract is paused")]
fn test_initiate_payment_fails_when_paused() {
    let (_env, _id, client) = setup();
    let user = Address::generate(&client.env);

    client.pause();

    register_test_anchor(&client, "co_1");
    push_rate(&client, "co_1", 150, 425_000i128);

    let request = RouteRequest {
        amount: 10_000_000,
        from_currency: Symbol::new(&client.env, "USDC"),
        to_currency: Symbol::new(&client.env, "COP"),
        destination_country: String::from_str(&client.env, "CO"),
    };

    client.initiate_payment(&user, &request);
}

#[test]
fn test_get_user_transactions() {
    let (_env, _id, client) = setup();
    let user = Address::generate(&client.env);

    register_test_anchor(&client, "co_1");
    push_rate(&client, "co_1", 150, 425_000i128);

    let request = RouteRequest {
        amount: 10_000_000,
        from_currency: Symbol::new(&client.env, "USDC"),
        to_currency: Symbol::new(&client.env, "COP"),
        destination_country: String::from_str(&client.env, "CO"),
    };

    // Initiate two payments.
    client.initiate_payment(&user, &request);
    client.initiate_payment(&user, &request);

    let tx_ids = client.get_user_transactions(&user);
    assert_eq!(tx_ids.len(), 2);
}

#[test]
fn test_get_transaction_by_id() {
    let (_env, _id, client) = setup();
    let user = Address::generate(&client.env);

    register_test_anchor(&client, "co_1");
    push_rate(&client, "co_1", 150, 425_000i128);

    let request = RouteRequest {
        amount: 10_000_000,
        from_currency: Symbol::new(&client.env, "USDC"),
        to_currency: Symbol::new(&client.env, "COP"),
        destination_country: String::from_str(&client.env, "CO"),
    };

    let result = client.initiate_payment(&user, &request);
    let tx_id = result.transaction.id;

    let fetched = client.get_transaction(&tx_id).expect("tx not found");
    assert_eq!(fetched.id, tx_id);
}

#[test]
fn test_anchor_registration_stored_correctly() {
    let (_env, _id, client) = setup();

    register_test_anchor(&client, "co_1");

    let anchor = client
        .get_anchor(&String::from_str(&client.env, "co_1"))
        .expect("anchor should exist");
    assert_eq!(anchor.id, String::from_str(&client.env, "co_1"));
}
