import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreatePrivateRoom } from './dto/crate-private-room.dto';

@Injectable()
export class RoomService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    const res = await this.db.room.findMany({
      include: { _count: { select: { users: true } } },
    });
    return res;
  }

  async findOne(id: string) {
    return this.db.room.findUnique({
      where: { id },
      include: { users: true },
    });
  }

  async createRoom(obj: CreateRoomDto) {
    const room = await this.db.room.create({
      data: obj,
      include: { _count: { select: { users: true } } },
    });
    return room;
  }

  async createPrivateRoom(obj: CreatePrivateRoom) {
    console.log(obj);
    const room = await this.db.room.create({
      data: obj,
      include: { _count: { select: { users: true } } },
    });
    return room;
  }

  async deleteRoom(id: string) {
    const res = await this.db.room.delete({
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
