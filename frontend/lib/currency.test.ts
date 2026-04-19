import { amountToMinorUnits, formatCurrency, minorUnitsToAmount } from "@/lib/currency";

describe("currency conversion", () => {
  it("converts decimal amount to minor units", () => {
    expect(amountToMinorUnits("500.25", "USDC")).toBe(50025);
  });

  it("converts minor units to decimal amount", () => {
    expect(minorUnitsToAmount(50025, "USDC")).toBe(500.25);
  });

  it("formats minor units into currency string", () => {
    expect(formatCurrency(50025, "USDC")).toBe("$500.25");
  });
});
