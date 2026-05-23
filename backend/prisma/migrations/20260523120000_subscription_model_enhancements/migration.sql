-- AlterEnum: EXPIRED status for subscription lifecycle (S2-T8A)
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

-- AlterTable: Stripe-ready fields and optional period start (S2-T8A)
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "canceledAt" TIMESTAMP(3);
ALTER TABLE "Subscription" ALTER COLUMN "currentPeriodStart" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");
