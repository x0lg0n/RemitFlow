import axios from "axios";
import { AnchorConfig, FetchedRate } from "../../shared/types/oracle.types";

/**
 * Fetch fee and FX rate data from a single anchor's SEP-31 API.
 * Calls /fee and /quotes endpoints concurrently.
 */
export async function fetchAnchorRate(
  anchor: AnchorConfig,
  fromCurrency: string,
  toCurrency: string,
  destinationCountry: string
): Promise<FetchedRate | null> {
  try {
    const [feeResponse, quoteResponse] = await Promise.allSettled([
      axios.get(`${anchor.baseUrl}/fee`, {
        params: {
          amount: 1000,
          asset_code: fromCurrency,
          asset_issuer: "",
          destination_country: destinationCountry,
        },
        headers: { Authorization: `Bearer ${anchor.authToken}` },
        timeout: 5000,
      }),
      axios.get(`${anchor.baseUrl}/quotes`, {
        params: {
          source_asset: fromCurrency,
          destination_asset: toCurrency,
          destination_country: destinationCountry,
        },
        headers: { Authorization: `Bearer ${anchor.authToken}` },
        timeout: 5000,
      }),
    ]);

    if (feeResponse.status === "rejected") {
      console.error(
        `[${anchor.id}] Fee fetch failed: ${feeResponse.reason.message}`
      );
      return null;
    }

    if (quoteResponse.status === "rejected") {
      console.error(
        `[${anchor.id}] Quote fetch failed: ${quoteResponse.reason.message}`
      );
      return null;
    }

    const feeData = feeResponse.value.data;
    const quoteData = quoteResponse.value.data;

    // Parse fee_percent from anchor response (may be nested differently per anchor).
    let feePercent = 0;
    if (feeData.fee_percent !== undefined) feePercent = feeData.fee_percent;
    else if (feeData.fee?.fee_percent !== undefined) feePercent = feeData.fee.fee_percent;
    else if (feeData.fees) feePercent = feeData.fees.percent ?? 0;

    // Parse FX rate (may be "rate" or "price" depending on anchor).
    const fxRate = Number(quoteData.rate ?? quoteData.price ?? quoteData.quote?.rate ?? 0);

    const minAmount = Number(
      quoteData.min_amount ?? quoteData.min ?? feeData.min_amount ?? 0
    );
    const maxAmount = Number(
      quoteData.max_amount ?? quoteData.max ?? feeData.max_amount ?? 0
    );

    return {
      anchorId: anchor.id,
      fromCurrency,
      toCurrency,
      destinationCountry,
      feePercent,
      fxRate,
      minAmount,
      maxAmount,
      fetchedAt: new Date(),
    };
  } catch (error) {
    console.error(
      `[${anchor.id}] Unexpected error fetching rates:`,
      (error as Error).message
    );
    return null;
  }
}
