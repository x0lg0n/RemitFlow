use soroban_sdk::{contracttype, vec, Address, Env, String, Symbol, Vec};

use crate::admin::require_admin;
use crate::events;

/// Represents an anchor registered for routing.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Anchor {
    /// Unique identifier for this anchor (e.g. "anchor_colombia_1").
    pub id: String,
    /// Stellar address of the anchor's settlement account.
    pub address: Address,
    /// Human-readable name.
    pub name: String,
    /// Currency codes this anchor supports (e.g. USDC, NGN, COP).
    pub supported_currencies: Vec<Symbol>,
    /// Destination country codes this anchor serves (e.g. "CO", "NG").
    pub supported_countries: Vec<String>,
    /// Whether the anchor is currently available for routing.
    pub is_active: bool,
}

/// Storage key for the list of all anchor IDs.
const ANCHOR_IDS_KEY: &str = "ANCHOR_IDS";

/// Store an anchor. Admin only.
pub fn register_anchor(env: &Env, anchor: &Anchor) {
    require_admin(env);

    let key = anchor_key(env, &anchor.id);
    env.storage().persistent().set(&key, anchor);

    // Add to the global list if not already present.
    add_anchor_id(env, &anchor.id);

    let admin = crate::admin::get_admin(env).unwrap();
    events::emit_anchor_registered(env, anchor.id.clone(), anchor.name.clone(), admin);
}

/// Retrieve an anchor by ID. Returns None if not found.
pub fn get_anchor(env: &Env, id: &String) -> Option<Anchor> {
    let key = anchor_key(env, id);
    env.storage().persistent().get(&key)
}

/// Toggle the active status of an anchor. Admin only.
pub fn set_anchor_active(env: &Env, id: &String, active: bool) {
    require_admin(env);

    let key = anchor_key(env, id);
    let mut anchor = env
        .storage()
        .persistent()
        .get::<_, Anchor>(&key)
        .expect("anchor not found");

    anchor.is_active = active;
    env.storage().persistent().set(&key, &anchor);
}

/// Return all anchor IDs that have ever been registered.
pub fn get_all_anchor_ids(env: &Env) -> Vec<String> {
    env.storage()
        .instance()
        .get(&ANCHOR_IDS_KEY)
        .unwrap_or_else(|| vec![env])
}

/// Return only the IDs of anchors that are currently active.
pub fn get_active_anchor_ids(env: &Env) -> Vec<String> {
    let all_ids = get_all_anchor_ids(env);
    let mut active_ids = vec![env];

    for id in all_ids.iter() {
        if let Some(anchor) = get_anchor(env, &id) {
            if anchor.is_active {
                active_ids.push_back(id);
            }
        }
    }

    active_ids
}

// ─── Internal helpers ───────────────────────────────────────────────────────

/// Storage key for anchor records.
#[contracttype]
enum AnchorDataKey {
    Anchor(String),
}

fn anchor_key(_env: &Env, id: &String) -> AnchorDataKey {
    AnchorDataKey::Anchor(id.clone())
}

fn add_anchor_id(env: &Env, id: &String) {
    let mut ids: Vec<String> = env
        .storage()
        .instance()
        .get(&ANCHOR_IDS_KEY)
        .unwrap_or_else(|| vec![env]);

    // Avoid duplicates.
    for existing in ids.iter() {
        if existing == *id {
            return;
        }
    }
    ids.push_back(id.clone());
    env.storage().instance().set(&ANCHOR_IDS_KEY, &ids);
}
