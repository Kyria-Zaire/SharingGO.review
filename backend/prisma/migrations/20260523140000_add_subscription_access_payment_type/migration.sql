-- AlterEnum: subscription booking bypass payment trace (S2-T8C)
ALTER TYPE "PaymentType" ADD VALUE IF NOT EXISTS 'SUBSCRIPTION_ACCESS';
