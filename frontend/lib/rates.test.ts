import { calculateSavingsVsAverage, compareRates } from "@/lib/rates";
import type { AnchorRate } from "@/types/rate";

describe("rate comparison", () => {
  const rates: AnchorRate[] = [
    {
      anchorId: "a1",
      anchorName: "ColombiaOne",
      fromCurrency: "USDC",
      toCurrency: "COP",
      destinationCountry: "CO",
      feeBps: 100,
      feePercent: 1,
      fxRate: 4250,
      minAmount: 100,
      maxAmount: 1_000_000,
      lastUpdated: null,
      estimatedArrival: null,
    },
    {
      anchorId: "a2",
      anchorName: "LatAmFast",
      fromCurrency: "USDC",
      toCurrency: "COP",
      destinationCountry: "CO",
      feeBps: 250,
      feePercent: 2.5,
      fxRate: 4240,
      minAmount: 100,
      maxAmount: 1_000_000,
      lastUpdated: null,
      estimatedArrival: null,
    },
  ];

  it("sorts compared rates by total cost", () => {
    const compared = compareRates(rates, 50000);
    expect(compared[0].anchorId).toBe("a1");
    expect(compared[0].totalCostMinor).toBeLessThan(compared[1].totalCostMinor);
  });

  it("calculates positive savings vs average", () => {
    const compared = compareRates(rates, 50000);
    const savings = calculateSavingsVsAverage(compared.map((item) => item.totalCostMinor));
    expect(savings).toBeGreaterThan(0);
  });
});
