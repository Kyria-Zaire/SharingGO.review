-- F3-T12: createdBy + lastLoginAt (nullable, future-ready)
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "createdByUserId" TEXT;

ALTER TABLE "User" ADD CONSTRAINT "User_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "User_createdByUserId_idx" ON "User"("createdByUserId");
