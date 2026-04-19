/** Configuration for a single anchor's API. */
export interface AnchorConfig {
  id: string;
  baseUrl: string;
  authToken: string;
  sourceAssets: string[];
  destinationAssets: string[];
  supportedCountries: string[];
}

/** Raw rate fetched from an anchor API. */
export interface FetchedRate {
  anchorId: string;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
  feePercent: number;
  fxRate: number;
  minAmount: number;
  maxAmount: number;
  fetchedAt: Date;
}

/** Rate after validation, ready for publishing. */
export interface ValidatedRate extends FetchedRate {
  isValid: true;
}

/** Result of the validation step. */
export interface ValidationResult {
  valid: ValidatedRate[];
  rejected: { anchorId: string; reason: string }[];
}

/** Result of publishing a rate to a destination. */
export interface PublishResult {
  anchorId: string;
  dbSuccess: boolean;
  redisSuccess: boolean;
  contractSuccess: boolean;
  contractTxHash?: string;
  error?: string;
}
