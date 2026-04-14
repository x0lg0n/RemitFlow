use soroban_sdk::{contracttype, Address, Env, String, Symbol, Vec};

use crate::anchor;
use crate::rates::{self, AnchorRate};

/// A user's request for a remittance route.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RouteRequest {
    /// Amount to send in stroops (or smallest unit).
    pub amount: i128,
    /// Source currency symbol (e.g. "USDC").
    pub from_currency: Symbol,
    /// Destination currency symbol (e.g. "COP").
    pub to_currency: Symbol,
    /// Destination country code (e.g. "CO").
    pub destination_country: String,
}

/// The result of route optimization — the best anchor for a given request.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BestRoute {
    /// The selected anchor's rate.
    pub rate: AnchorRate,
    /// Anchor's Stellar address.
    pub anchor_address: Address,
    /// Anchor's human-readable name.
    pub anchor_name: String,
    /// Total fee in stroops calculated from fee_bps.
    pub fee: i128,
    /// Total amount the recipient will receive in destination currency units.
    pub destination_amount: i128,
}

/// Find the cheapest route among all active anchors for the given request.
///
/// Returns `None` if no active anchor supports the requested currency pair
/// and destination country, or if all anchors have stale rates.
pub fn find_best_route(env: &Env, request: &RouteRequest) -> Option<BestRoute> {
    let active_ids = anchor::get_active_anchor_ids(env);

    let mut best: Option<BestRoute> = None;

    for anchor_id in active_ids.iter() {
        // Fetch anchor record.
        let anchor_record = match anchor::get_anchor(env, &anchor_id) {
            Some(a) => a,
            None => continue,
        };

        // Check that the anchor supports both currencies.
        if !currency_supported(&anchor_record.supported_currencies, &request.from_currency) {
            continue;
        }
        if !currency_supported(&anchor_record.supported_currencies, &request.to_currency) {
            continue;
        }

        // Check that the anchor supports the destination country.
        if !country_supported(&anchor_record.supported_countries, &request.destination_country) {
            continue;
        }

        // Fetch the anchor's current rate.
        let rate = match rates::get_anchor_rate(env, &anchor_id) {
            Some(r) => r,
            None => continue,
        };

        // Check amount is within the anchor's accepted range.
        if request.amount < rate.min_amount || request.amount > rate.max_amount {
            continue;
        }

        // Calculate fee: amount * fee_bps / 10000.
        let fee = request.amount * (rate.fee_bps as i128) / 10_000;

        // Calculate destination amount: (amount - fee) * fx_rate.
        // fx_rate is scaled (e.g. 425000 means 4250.00, divisor = 100).
        let fx_divisor: i128 = 100;
        let net_amount = request.amount - fee;
        let dest_amount = net_amount * rate.fx_rate / fx_divisor;

        let candidate = BestRoute {
            rate: rate.clone(),
            anchor_address: anchor_record.address,
            anchor_name: anchor_record.name,
            fee,
            destination_amount: dest_amount,
        };

        // Select the route with the lowest fee.
        match &best {
            Some(existing) => {
                if candidate.fee < existing.fee {
                    best = Some(candidate);
                }
            }
            None => {
                best = Some(candidate);
            }
        }
    }

    best
}

// ─── Internal helpers ───────────────────────────────────────────────────────

fn currency_supported(currencies: &Vec<Symbol>, currency: &Symbol) -> bool {
    for sym in currencies.iter() {
        if sym == *currency {
            return true;
        }
    }
    false
}

fn country_supported(currencies: &Vec<String>, country: &String) -> bool {
    for c in currencies.iter() {
        if c == *country {
            return true;
        }
    }
    false
}
