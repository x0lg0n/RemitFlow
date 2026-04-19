use soroban_sdk::{Address, Env};

use crate::events;

/// Storage key for the admin address.
const ADMIN_KEY: &str = "ADMIN";
/// Storage key for the oracle address.
const ORACLE_KEY: &str = "ORACLE";
/// Storage key for the paused flag.
const PAUSED_KEY: &str = "PAUSED";

/// Set the admin address. Called during initialization.
pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&ADMIN_KEY, admin);
}

/// Get the stored admin address.
pub fn get_admin(env: &Env) -> Option<Address> {
    env.storage().instance().get(&ADMIN_KEY)
}

/// Set the oracle address. Called during initialization.
pub fn set_oracle(env: &Env, oracle: &Address) {
    env.storage().instance().set(&ORACLE_KEY, oracle);
}

/// Get the stored oracle address.
pub fn get_oracle(env: &Env) -> Option<Address> {
    env.storage().instance().get(&ORACLE_KEY)
}

/// Require that the caller is the stored admin.
pub fn require_admin(env: &Env) {
    let admin = get_admin(env).expect("admin not set");
    admin.require_auth();
}

/// Require that the caller is the stored oracle.
pub fn require_oracle(env: &Env) {
    let oracle = get_oracle(env).expect("oracle not set");
    oracle.require_auth();
}

/// Check whether the contract is paused.
pub fn is_paused(env: &Env) -> bool {
    env.storage().instance().get(&PAUSED_KEY).unwrap_or(false)
}

/// Require that the contract is not paused.
pub fn require_not_paused(env: &Env) {
    if is_paused(env) {
        panic!("contract is paused");
    }
}

/// Pause the contract. Admin only.
pub fn pause(env: &Env) {
    require_admin(env);
    env.storage().instance().set(&PAUSED_KEY, &true);
    let admin = get_admin(env).unwrap();
    events::emit_contract_status_changed(env, true, admin, env.ledger().sequence());
}

/// Unpause the contract. Admin only.
pub fn unpause(env: &Env) {
    require_admin(env);
    env.storage().instance().set(&PAUSED_KEY, &false);
    let admin = get_admin(env).unwrap();
    events::emit_contract_status_changed(env, false, admin, env.ledger().sequence());
}
