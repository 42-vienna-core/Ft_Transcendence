-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('WAITING', 'READY', 'PLAYING', 'FINISHED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'BOT';

-- AlterTable
ALTER TABLE "GameRoom" ADD COLUMN     "status" "RoomStatus" NOT NULL DEFAULT 'WAITING';

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "isBot" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "GameResults" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "winnerId" INTEGER,
    "ticks" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameParticipants" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "alive" BOOLEAN NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "GameParticipants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameParticipants_gameId_userId_key" ON "GameParticipants"("gameId", "userId");

-- AddForeignKey
ALTER TABLE "GameResults" ADD CONSTRAINT "GameResults_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GameRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameResults" ADD CONSTRAINT "GameResults_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameParticipants" ADD CONSTRAINT "GameParticipants_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameResults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameParticipants" ADD CONSTRAINT "GameParticipants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
