const CURRENCY_DECIMALS: Record<string, number> = {
  USD: 2,
  USDC: 2,
  COP: 2,
  NGN: 2,
  EUR: 2,
};

export function getCurrencyDecimals(currency: string): number {
  return CURRENCY_DECIMALS[currency.toUpperCase()] ?? 2;
}

export function amountToMinorUnits(amount: string, currency: string): number {
  const normalized = amount.trim();
  if (!normalized) return 0;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;

  const decimals = getCurrencyDecimals(currency);
  const factor = 10 ** decimals;
  return Math.round(parsed * factor);
}

export function minorUnitsToAmount(minor: number, currency: string): number {
  const decimals = getCurrencyDecimals(currency);
  const factor = 10 ** decimals;
  return minor / factor;
}

export function formatCurrency(minor: number, currency: string): string {
  const value = minorUnitsToAmount(minor, currency);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "USDC" ? "USD" : currency,
    minimumFractionDigits: getCurrencyDecimals(currency),
    maximumFractionDigits: getCurrencyDecimals(currency),
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}
