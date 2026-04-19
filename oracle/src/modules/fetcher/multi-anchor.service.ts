import { pool } from "../../shared/config/database";
import { AnchorConfig, FetchedRate } from "../../shared/types/oracle.types";
import { fetchAnchorRate } from "./anchor-fetcher.service";

/**
 * Fetch rates from ALL active anchors concurrently.
 * Uses Promise.allSettled so one anchor failure doesn't block others.
 */
export async function fetchAllRates(): Promise<(FetchedRate | null)[]> {
  const anchors = await getActiveAnchors();
  console.log(`Oracle: Fetching rates from ${anchors.length} anchors...`);

  const results = await Promise.allSettled(
    anchors.map(async (anchor) => {
      const rates: (FetchedRate | null)[] = [];

      for (const fromCurrency of anchor.sourceAssets) {
        for (const toCurrency of anchor.destinationAssets) {
          if (fromCurrency === toCurrency) continue;

          for (const destinationCountry of anchor.supportedCountries) {
            const rate = await fetchAnchorRate(
              anchor,
              fromCurrency,
              toCurrency,
              destinationCountry
            );
            if (rate) rates.push(rate);
          }
        }
      }

      return rates;
    })
  );

  // Flatten results.
  const allRates: (FetchedRate | null)[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allRates.push(...result.value);
    } else {
      console.error("Oracle: Anchor fetch batch failed:", result.reason);
    }
  }

  const successful = allRates.filter((r): r is FetchedRate => r !== null);
  console.log(
    `Oracle: Successfully fetched ${successful.length}/${allRates.length} rates`
  );

  return allRates;
}

/** Load active anchor configs from the database. */
async function getActiveAnchors(): Promise<AnchorConfig[]> {
  const { rows } = await pool.query<{
    id: string;
    base_url: string;
    auth_token: string;
    supported_currencies: string[];
    supported_countries: string[];
  }>(
    `SELECT id, base_url, auth_token, supported_currencies, supported_countries
     FROM anchors
     WHERE is_active = true`
  );

  return rows.map((row) => {
    const currencies = row.supported_currencies
      .map((currency) => currency.toUpperCase())
      .filter(Boolean);

    return {
      id: row.id,
      baseUrl: row.base_url,
      authToken: row.auth_token,
      sourceAssets: currencies,
      destinationAssets: currencies,
      supportedCountries: row.supported_countries
        .map((country) => country.toUpperCase())
        .filter(Boolean),
    };
  });
}
