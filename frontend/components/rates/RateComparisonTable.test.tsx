import { render, screen } from "@testing-library/react";
import { RateComparisonTable } from "@/components/rates/RateComparisonTable";

describe("RateComparisonTable", () => {
  it("marks the first row as cheapest", () => {
    render(
      <RateComparisonTable
        fromCurrency="USDC"
        toCurrency="COP"
        rates={[
          {
            anchorId: "best",
            anchorName: "BestAnchor",
            feeMinor: 500,
            totalCostMinor: 50500,
            destinationAmountMinor: 2100000,
            fxRate: 4200,
            feePercent: 1,
          },
          {
            anchorId: "other",
            anchorName: "OtherAnchor",
            feeMinor: 900,
            totalCostMinor: 50900,
            destinationAmountMinor: 2095000,
            fxRate: 4190,
            feePercent: 1.8,
          },
        ]}
      />
    );

    expect(screen.getByText("Cheapest")).toBeInTheDocument();
    expect(screen.getByText("BestAnchor")).toBeInTheDocument();
  });
});
