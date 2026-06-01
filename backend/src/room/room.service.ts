import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreatePrivateRoom } from './dto/crate-private-room.dto';
import { RoomGateway } from './room.gateway';

@Injectable()
export class RoomService {
  constructor(
    private db: DatabaseService,
    private roomGateway: RoomGateway,
  ) {}

  async createRoom(obj: CreateRoomDto) {
    const room = await this.db.room.create({
      data: {
        name: obj.name,
        maxUsers: obj.maxUsers,
        type: obj.type,
      },
    });
    this.roomGateway.server.emit('room_created', room);
    return room;
  }

  async createPrivateRoom(obj: CreatePrivateRoom) {
    const room = await this.db.room.create({
      data: {
        name: obj.name,
        maxUsers: obj.maxUsers,
        type: obj.type,
        ownerId: obj.ownerId,
      },
    });
    this.roomGateway.server.emit('Private_room', room);
    return room;
  }

  async findAll() {
    const res = await this.db.room.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
    return res;
  }

  async deleteRoom(id: string) {
    const res = await this.db.room.delete({
      where: {
        id,
      },
    });
    return res;
  }
}
