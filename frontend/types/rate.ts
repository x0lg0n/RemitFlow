export interface AnchorRate {
  anchorId: string;
  anchorName: string;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
  feeBps: number;
  feePercent: number;
  fxRate: number;
  minAmount: number;
  maxAmount: number;
  lastUpdated: string | null;
  estimatedArrival: string | null;
}

export interface BestRouteResponse {
  anchorId: string;
  anchorName: string;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
  feeBps: number;
  feePercent: number;
  fxRate: number;
  totalFee: number;
  totalCost: number;
  destinationAmount: number;
  estimatedArrival: string | null;
  savingsVsAverage: number;
}

export interface RateRequest {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
}
