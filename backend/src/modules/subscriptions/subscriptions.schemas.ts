import { SubscriptionType } from "@prisma/client";
import { z } from "zod";

export const subscriptionCheckoutBodySchema = z.object({
  type: z.enum([SubscriptionType.MOSOLF_MONTHLY, SubscriptionType.CONVOYEUR_MONTHLY]),
});

export type SubscriptionCheckoutBody = z.infer<typeof subscriptionCheckoutBodySchema>;
