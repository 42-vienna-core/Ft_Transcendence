import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGameRoomDto } from './dto/create-gameRoom.dto';
import { CreatePrivateGameRoom } from './dto/create-private-gameRoom.dto';
import { RoomStatus } from "@prisma/client";
import { Match } from './interfaces/room-update.interface';


@Injectable()
export class GameRoomService {
  constructor(private db: PrismaService) {}

  async findAll() {
    const res = await this.db.gameRoom.findMany({
      //include: { _count: { select: { users: true } } },
    });
    return res;
  }

  async findOne(id: string) {
    return this.db.gameRoom.findUnique({
      where: { id },
      //include: { users: true },
    });
  }

  async createRoom(obj: CreateGameRoomDto) {
    const room = await this.db.gameRoom.create({
      data: obj,
      //include: { _count: { select: { users: true } } },
    });
    return room;
  }

  async createPrivateRoom(obj: CreatePrivateGameRoom) {
    console.log(obj);
    const room = await this.db.gameRoom.create({
      data: obj,
      //include: { _count: { select: { users: true } } },
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

  async addBotsToRoom(roomId: string){
	const room = await this.db.gameRoom.findUnique({
		where : {id: roomId},
		select: { 
			maxUsers: true,
			roomUsers: {
				select: {
					userId: true
				},
			},
		},
	});
	if (!room)
		return;
	const participants = room.roomUsers.length;
	const freeSlots = room.maxUsers - participants;
	if (freeSlots <= 0)
		return ;
	const usedUserIds = room.roomUsers.map((roomUser) => roomUser.userId);
	const freeBots = await this.db.users.findMany({
		where: {
			isBot : true,
			id: {notIn: usedUserIds},
		},
		select: {
			id: true,
		},
		take: freeSlots,
	});

	for (const bot of freeBots){
		await this.db.roomUser.create({
			data: {
				roomId,
				userId: bot.id,
				socketId: null,
			},
		});
	}
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

  async findActiveRoomWithUser(userId: number){
	return this.db.gameRoom.findFirst({
		where: {
			status: {
				in: [
					RoomStatus.PLAYING,
					RoomStatus.WAITING,
					RoomStatus.READY,
				],
			},
			roomUsers: {
				some: {
					userId,
				},
			},
		},
	});
  }

  async getRoomUpdate(roomId: string) : Promise<Match>{
	const room = await this.db.gameRoom.findUnique({
		where: {id: roomId},
	});
	if (!room)
		throw new BadRequestException('Room not found');

	const participants = await this.db.roomUser.findMany({
		where: {roomId: roomId},
		select: {
			user: {
				select: {
					id: true, 
					avatar: true,
					name: true,
				},
			},
			room: {
				select: {
					ownerId: true,
				},
			},
		},
	});

	return {
		roomId,
		roomStatus: room.status,
		timer: room.waitTimeout?.getTime() ?? null,
		players: participants.map(({user, room}) => ({
			...user,
			isOwner: user.id === room.ownerId,
		})),
	};
  }

}
