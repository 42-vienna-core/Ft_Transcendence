-- AlterEnum
ALTER TYPE "RoomType" ADD VALUE 'FRIEND';

-- AlterTable
ALTER TABLE "GameRoom" ADD COLUMN     "waitTimeout" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "codeExpire" TIMESTAMP(3),
ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#39FF14',
ADD COLUMN     "resetCode" TEXT,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;
