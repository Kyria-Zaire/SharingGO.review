import type { ReportsPeriodPreset, ReportsPeriodState } from "@/types/reports.types";

export function buildReportsPeriod(preset: ReportsPeriodPreset): ReportsPeriodState {
  const now = new Date();
  const to = now.toISOString();
  let fromDate: Date;

  switch (preset) {
    case "today": {
      fromDate = new Date(now);
      fromDate.setHours(0, 0, 0, 0);
      break;
    }
    case "30d":
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "7d":
    default:
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
  }

  return {
    preset,
    from: fromDate.toISOString(),
    to,
  };
}

export const DEFAULT_REPORTS_PERIOD = buildReportsPeriod("7d");

export function formatCurrency(amount: string, currency = "eur"): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return `${amount} ${currency.toUpperCase()}`;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toLowerCase(),
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)} %`;
}
