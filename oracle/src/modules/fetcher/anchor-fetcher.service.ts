import axios from "axios";
import { AnchorConfig, FetchedRate } from "../../shared/types/oracle.types";

interface RateCallbackResponse {
  price?: string | number;
  sell_amount?: string | number;
  buy_amount?: string | number;
  fee?: {
    total?: string | number;
  };
}

async function fetchFromRateCallback(
  anchor: AnchorConfig,
  fromCurrency: string,
  toCurrency: string,
  destinationCountry: string
): Promise<FetchedRate | null> {
  try {
    const response = await axios.get<RateCallbackResponse>(`${anchor.baseUrl}/rate`, {
      params: {
        type: "indicative",
        sell_asset: `stellar:${fromCurrency}`,
        buy_asset: `stellar:${toCurrency}`,
        sell_amount: 1000,
        destination_country: destinationCountry,
      },
      headers: {
        Authorization: `Bearer ${anchor.authToken}`,
        "x-remitflow-internal-client": "oracle",
      },
      timeout: 5000,
      validateStatus: (status) => status < 500,
    });

    const { data } = response;

    const fxRate = Number(data.price ?? 0);
    const sellAmount = Number(data.sell_amount ?? 0);
    const feeAmount = Number(data.fee?.total ?? 0);

    if (!Number.isFinite(fxRate) || fxRate <= 0) {
      console.warn(
        `[${anchor.id}] Rate callback returned no usable quote (${response.status}) for ${fromCurrency}->${toCurrency} ${destinationCountry}`
      );
      return null;
    }

    const feePercent = sellAmount > 0 ? (feeAmount / sellAmount) * 100 : 0;

    return {
      anchorId: anchor.id,
      fromCurrency,
      toCurrency,
      destinationCountry,
      feePercent,
      fxRate,
      minAmount: 1,
      maxAmount: 1_000_000,
      fetchedAt: new Date(),
    };
  } catch (error) {
    console.error(
      `[${anchor.id}] Rate callback fallback failed:`,
      (error as Error).message
    );
    return null;
  }
}

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
  const rateOnlyMode = (process.env.ORACLE_USE_RATE_CALLBACK_ONLY ?? "false").toLowerCase() === "true";
  if (rateOnlyMode) {
    return fetchFromRateCallback(anchor, fromCurrency, toCurrency, destinationCountry);
  }

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
      return fetchFromRateCallback(
        anchor,
        fromCurrency,
        toCurrency,
        destinationCountry
      );
    }

    if (quoteResponse.status === "rejected") {
      console.error(
        `[${anchor.id}] Quote fetch failed: ${quoteResponse.reason.message}`
      );
      return fetchFromRateCallback(
        anchor,
        fromCurrency,
        toCurrency,
        destinationCountry
      );
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

    const fetched: FetchedRate = {
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

    if (!Number.isFinite(fetched.fxRate) || fetched.fxRate <= 0) {
      return fetchFromRateCallback(
        anchor,
        fromCurrency,
        toCurrency,
        destinationCountry
      );
    }

    return fetched;
  } catch (error) {
    console.error(
      `[${anchor.id}] Unexpected error fetching rates:`,
      (error as Error).message
    );
    return fetchFromRateCallback(
      anchor,
      fromCurrency,
      toCurrency,
      destinationCountry
    );
  }
}
