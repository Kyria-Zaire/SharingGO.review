/**
 * Centralized currency formatting for admin financial views.
 * Handles amount as string (API) or number, normalizes currency codes (e.g. eur → EUR).
 */
export function formatCurrency(amount: string | number, currency = "eur"): string {
  const numeric =
    typeof amount === "string" ? Number.parseFloat(amount.replace(",", ".")) : amount;

  if (Number.isNaN(numeric)) {
    return "—";
  }

  const normalized = currency.trim().toUpperCase();
  const isoCurrency = normalized === "EUR" || normalized === "€" ? "EUR" : normalized;

  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: isoCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `${numeric.toFixed(2)} ${normalized}`;
  }
}

export function parseCurrencyAmount(amount: string | number): number {
  if (typeof amount === "number") {
    return Number.isNaN(amount) ? 0 : amount;
  }
  const parsed = Number.parseFloat(amount.replace(",", "."));
  return Number.isNaN(parsed) ? 0 : parsed;
}
