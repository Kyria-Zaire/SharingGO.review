import { Prisma } from "@prisma/client";
import { env } from "../config/env.js";

/** Montant ticket unitaire EUR, aligné sur `STRIPE_TICKET_PRICE_CENTS` (ex. 899 → 8,99 €). */
export function ticketAmountEur(): Prisma.Decimal {
  return new Prisma.Decimal((env.stripeTicketPriceCents / 100).toFixed(2));
}
