/*
  Warnings:

  - A unique constraint covering the columns `[provider,providerId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "RoomStatus" ADD VALUE 'ABANDONED';

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "totMatches" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Users_provider_providerId_key" ON "Users"("provider", "providerId");
