-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "has_password" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pending_password" TEXT,
ADD COLUMN     "reset_code_attempts" INTEGER NOT NULL DEFAULT 0;
