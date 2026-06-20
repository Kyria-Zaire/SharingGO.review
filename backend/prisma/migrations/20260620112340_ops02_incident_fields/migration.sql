-- CreateEnum
CREATE TYPE "IncidentSource" AS ENUM ('MANUAL', 'BOARDING_FIELD', 'DEPARTURE_HEURISTIC', 'MONITORING', 'ACTIVITY_SUGGESTION');

-- CreateEnum
CREATE TYPE "IncidentClosedReason" AS ENUM ('FIXED', 'FALSE_ALARM', 'DUPLICATE', 'WONT_FIX');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IncidentType" ADD VALUE 'BOARDING';
ALTER TYPE "IncidentType" ADD VALUE 'CAPACITY';
ALTER TYPE "IncidentType" ADD VALUE 'PAYMENT';
ALTER TYPE "IncidentType" ADD VALUE 'NO_SHOW';
ALTER TYPE "IncidentType" ADD VALUE 'SAFETY';

-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "assigned_to_user_id" TEXT,
ADD COLUMN     "closedReason" "IncidentClosedReason",
ADD COLUMN     "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "resolved_by_user_id" TEXT,
ADD COLUMN     "source" "IncidentSource" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "sourceRef" JSONB;

-- CreateIndex
CREATE INDEX "Incident_severity_idx" ON "Incident"("severity");

-- CreateIndex
CREATE INDEX "Incident_source_idx" ON "Incident"("source");

-- CreateIndex
CREATE INDEX "Incident_status_severity_idx" ON "Incident"("status", "severity");

-- CreateIndex
CREATE INDEX "Incident_related_trip_id_status_idx" ON "Incident"("related_trip_id", "status");

-- CreateIndex
CREATE INDEX "Incident_assigned_to_user_id_idx" ON "Incident"("assigned_to_user_id");

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_resolved_by_user_id_fkey" FOREIGN KEY ("resolved_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
