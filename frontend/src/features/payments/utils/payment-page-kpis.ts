import type { AdminPayment, PaymentPageKpis } from "@/types/payments.types";
import { parseCurrencyAmount } from "@/lib/format-currency";

export function computePaymentPageKpis(payments: AdminPayment[]): PaymentPageKpis {
  const currency = payments[0]?.currency ?? "eur";
  let succeeded = 0;
  let failed = 0;
  let amountTotal = 0;

  for (const payment of payments) {
    if (payment.status === "SUCCEEDED") succeeded += 1;
    if (payment.status === "FAILED") failed += 1;
    if (payment.status === "SUCCEEDED") {
      amountTotal += parseCurrencyAmount(payment.amount);
    }
  }

  return {
    total: payments.length,
    succeeded,
    failed,
    amountTotal,
    currency,
  };
}
