import axios from "axios";

/** Response from anchor SEP-31 /fee endpoint. */
interface AnchorFeeResponse {
  fee_fixed: number;
  fee_percent: number;
}

/** Response from anchor SEP-31 /quotes endpoint. */
interface AnchorQuoteResponse {
  rate: number;
  min_amount: number;
  max_amount: number;
}

/**
 * Fetch fee structure from an anchor's SEP-31 /fee endpoint.
 * @see https://developers.stellar.org/docs/guides/sep-0031/#fee
 */
export async function fetchAnchorFee(
  baseUrl: string,
  authToken: string,
  assetCode: string,
  assetIssuer: string
): Promise<AnchorFeeResponse> {
  const { data } = await axios.get<AnchorFeeResponse>(`${baseUrl}/fee`, {
    params: { amount: 1000, asset_code: assetCode, asset_issuer: assetIssuer },
    headers: { Authorization: `Bearer ${authToken}` },
    timeout: 5000,
  });
  return data;
}

/**
 * Fetch FX quote from an anchor's SEP-31 /quotes endpoint.
 * @see https://developers.stellar.org/docs/guides/sep-0031/#quote
 */
export async function fetchAnchorQuote(
  baseUrl: string,
  authToken: string,
  sourceAsset: string,
  destinationAsset: string
): Promise<AnchorQuoteResponse> {
  const { data } = await axios.get<AnchorQuoteResponse>(`${baseUrl}/quotes`, {
    params: { source_asset: sourceAsset, destination_asset: destinationAsset },
    headers: { Authorization: `Bearer ${authToken}` },
    timeout: 5000,
  });
  return data;
}

/**
 * Fetch anchor capabilities from SEP-31 /info endpoint.
 * @see https://developers.stellar.org/docs/guides/sep-0031/#info
 */
export async function fetchAnchorInfo(
  baseUrl: string
): Promise<Record<string, unknown>> {
  const { data } = await axios.get(`${baseUrl}/info`, { timeout: 5000 });
  return data;
}
