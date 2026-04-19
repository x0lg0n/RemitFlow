import { computeBestRoute } from "./rate.service";
import type { AnchorRate } from "../../shared/types/rate.types";

describe("computeBestRoute", () => {
  const rates: AnchorRate[] = [
    {
      anchorId: "colombia-one",
      anchorName: "ColombiaOne",
      fromCurrency: "USDC",
      toCurrency: "COP",
      destinationCountry: "CO",
      feeBps: 100,
      feePercent: 1,
      fxRate: 4250,
      minAmount: 100,
      maxAmount: 1_000_000,
      lastUpdated: new Date(),
      estimatedArrival: "30s",
    },
    {
      anchorId: "latam-fast",
      anchorName: "LatAmFast",
      fromCurrency: "USDC",
      toCurrency: "COP",
      destinationCountry: "CO",
      feeBps: 250,
      feePercent: 2.5,
      fxRate: 4240,
      minAmount: 100,
      maxAmount: 1_000_000,
      lastUpdated: new Date(),
      estimatedArrival: "40s",
    },
  ];

  it("returns cheapest total cost route and savings", () => {
    const best = computeBestRoute(rates, {
      amount: 50_000,
      fromCurrency: "USDC",
      toCurrency: "COP",
      destinationCountry: "CO",
    });

    expect(best).not.toBeNull();
    expect(best?.anchorId).toBe("colombia-one");
    expect(best?.totalFee).toBe(500);
    expect(best?.totalCost).toBe(50_500);
    expect(best?.savingsVsAverage).toBeGreaterThan(0);
  });

  it("returns null when no corridor matches", () => {
    const best = computeBestRoute(rates, {
      amount: 50_000,
      fromCurrency: "USDC",
      toCurrency: "NGN",
      destinationCountry: "NG",
    });

    expect(best).toBeNull();
  });
});
