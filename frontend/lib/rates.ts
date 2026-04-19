import type { AnchorRate } from "@/types/rate";

export interface ComparedRate {
  anchorId: string;
  anchorName: string;
  feeMinor: number;
  totalCostMinor: number;
  destinationAmountMinor: number;
  fxRate: number;
  feePercent: number;
}

export function compareRates(rates: AnchorRate[], amountMinor: number): ComparedRate[] {
  return rates
    .map((rate) => {
      const feeMinor = Math.round(amountMinor * (rate.feePercent / 100));
      return {
        anchorId: rate.anchorId,
        anchorName: rate.anchorName,
        feeMinor,
        totalCostMinor: amountMinor + feeMinor,
        destinationAmountMinor: Math.floor(amountMinor * rate.fxRate),
        fxRate: rate.fxRate,
        feePercent: rate.feePercent,
      };
    })
    .sort((a, b) => a.totalCostMinor - b.totalCostMinor);
}

export function calculateSavingsVsAverage(totalCostsMinor: number[]): number {
  if (totalCostsMinor.length <= 1) return 0;

  const sorted = [...totalCostsMinor].sort((a, b) => a - b);
  const cheapest = sorted[0];
  const average = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;

  if (average <= 0) return 0;
  return Number((((average - cheapest) / average) * 100).toFixed(2));
}
