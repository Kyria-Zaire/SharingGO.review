-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "usedAt" TIMESTAMP(3),
ADD COLUMN "usedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "Reservation_usedByUserId_idx" ON "Reservation"("usedByUserId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_usedByUserId_fkey" FOREIGN KEY ("usedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
