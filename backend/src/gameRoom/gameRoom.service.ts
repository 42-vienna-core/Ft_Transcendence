import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGameRoomDto } from './dto/create-gameRoom.dto';
import { CreatePrivateGameRoom } from './dto/create-private-gameRoom.dto';

@Injectable()
export class GameRoomService {
  constructor(private db: PrismaService) {}

  async findAll() {
    const res = await this.db.gameRoom.findMany({
      include: { _count: { select: { users: true } } },
    });
    return res;
  }

  async findOne(id: string) {
    return this.db.gameRoom.findUnique({
      where: { id },
      include: { users: true },
    });
  }

  async createRoom(obj: CreateGameRoomDto) {
    const room = await this.db.gameRoom.create({
      data: obj,
      include: { _count: { select: { users: true } } },
    });
    return room;
  }

  async createPrivateRoom(obj: CreatePrivateGameRoom) {
    console.log(obj);
    const room = await this.db.gameRoom.create({
      data: obj,
      include: { _count: { select: { users: true } } },
    });
    return room;
  }

  async deleteRoom(id: string) {
    const res = await this.db.gameRoom.delete({
      where: { id },
    });
    return res;
  }

  async addUserToRoom(roomId: string, userId: number, socketId: string) {
    return this.db.roomUser.upsert({
      where: { roomId_userId: { roomId, userId } },
      update: { socketId },
      create: { roomId, userId, socketId },
    });
  }

  async removeUserFromRoom(roomId: string, userId: number) {
    return this.db.roomUser.deleteMany({
      where: { roomId, userId },
    });
  }

  async getPlayerCount(roomId: string) {
    return this.db.roomUser.count({ where: { roomId } });
  }

  async findBySocketId(socketId: string) {
    return this.db.roomUser.findFirst({
      where: { socketId },
    });
  }
}
