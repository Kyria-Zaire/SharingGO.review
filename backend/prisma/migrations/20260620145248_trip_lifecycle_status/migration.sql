-- CreateEnum
CREATE TYPE "TripLifecycleStatus" AS ENUM ('WAITING', 'BOARDING', 'DEPARTED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "boardingStartedAt" TIMESTAMP(3),
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "departedAt" TIMESTAMP(3),
ADD COLUMN     "lifecycleStatus" "TripLifecycleStatus" NOT NULL DEFAULT 'WAITING',
ADD COLUMN     "lifecycleUpdatedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "Trip_lifecycleStatus_idx" ON "Trip"("lifecycleStatus");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_lifecycleUpdatedByUserId_fkey" FOREIGN KEY ("lifecycleUpdatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
