import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreatePrivateGameRoom } from '../dto/crate-private-gameRoom.dto';
@Injectable()
export class GameRoomService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(Status?:  'WAITING' | 'PLAYING' | 'FINISHED') {
    if (Status)
    {
      const room = await this.db.gameRoom.findMany({
        where: { status: Status},
         include: { _count: { select: { roomUsers: true } } },
      })
      return room;
    }
    return await this.db.gameRoom.findMany();
  }

  async createRoom(userId: number) {
    const rooms = await this.findAll("WAITING");
    if (rooms.length)
    {
      return {roomId: rooms[0].id};
    }
    const room = await this.db.gameRoom.create({
      data: {
        name: "Room",
        ownerId: userId
      },
      include: { _count: { select: { roomUsers: true } } },
    });
    return {roomId: room.id};
  }
  
   async addUserToRoom(roomId: string, userId: number, socketId: string) {
    return this.db.roomUser.upsert({
      where: { roomId_userId: { roomId, userId, } },
      update: { socketId },
      create: { roomId, userId, socketId },
    });
  }


   async findOne(id: string) {
    return this.db.gameRoom.findUnique({
      where: { id },
      include: { users: true },
    });
  }

  async createPrivateRoom(obj: CreatePrivateGameRoom) {
    const room = await this.db.gameRoom.create({
      data: obj,
      include: { _count: { select: { roomUsers: true } } },
    });
    return room;
  }

  async deleteRoom(id: string) {
    const res = await this.db.gameRoom.delete({
      where: { id },
    });
    return res;
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
