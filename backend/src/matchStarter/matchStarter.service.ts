import { RoomStatus, RoomType } from "prisma/generated";
import { PrismaService } from '../prisma/prisma.service';
import { GameRoomService } from "src/gameRoom/gameRoom.service";
import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { MatchMode } from "./dto/match.dto";
import { GameService } from "src/game/game.service";

export interface Match{
	roomId: string;
	roomStatus: RoomStatus;
	players: number;
}

@Injectable()
export class MatchStarter {

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly gameRoom: GameRoomService,
		private readonly gameService: GameService,
	){}

	async prepareCpuMatch(userId: number, socketId: string) : Promise<Match>{
		const room = await this.prismaService.gameRoom.create({
			data: {
				name: 'User vs CPU',
				ownerId: userId,
				type: 'PRIVATE',
				roomUsers: {
					create: {
						userId: userId,
						socketId: socketId,
					}
				}
			}
		})
	
		await this.gameRoom.addBotsToRoom(room.id);
		const ready = await this.prismaService.gameRoom.update({
			where: {id:room.id},
			data: { status: RoomStatus.READY}
		})
		const players = await this.gameRoom.getPlayerCount(room.id);
		return {
			roomId: room.id,
			roomStatus: ready.status,
			players:  players,
		};
	}

	async prepareQuickMatch(userId: number, socketId: string) : Promise<Match>{
		for (let retry = 0; retry < 3; retry++){
			let room = await this.prismaService.gameRoom.findFirst({
				where: {
					status: RoomStatus.WAITING,
					type: RoomType.PUBLIC
				},
			})
			if (!room){
				room = await this.gameRoom.createRoom({
					name: 'Quick Match',
					maxUsers: 4,
					type: RoomType.PUBLIC,
				})
			}
			let players = await this.gameRoom.getPlayerCount(room.id);
			if (players >= room.maxUsers){
				await this.prismaService.gameRoom.update({
					where: {id:room.id},
					data: { status: RoomStatus.READY}
				})
				continue ;
			}
			await this.gameRoom.addUserToRoom(room.id, userId, socketId);
			players = await this.gameRoom.getPlayerCount(room.id);
			let status = room.status;
			if (players >= room.maxUsers){
				await this.prismaService.gameRoom.update({
					where: {id:room.id},
					data: { status: RoomStatus.READY}
				})
				status = RoomStatus.READY;
			}
			
			return {
				roomId: room.id,
				roomStatus: status,
				players:  players,
			}
		}
		throw new ServiceUnavailableException('Could not find room, try again');
	}
	
	async prepareFriendsMatch(userId: number, socketId: string): Promise<Match> {
		return (this.prepareCpuMatch(userId, socketId));
		//TO BE IMPLEMENTED!!!
	}

	async startMatch(roomId: string){
		const room = await this.prismaService.gameRoom.updateMany({
			where: {
				id: roomId,
				status: RoomStatus.READY,
			},
			data: {
				status: RoomStatus.PLAYING,
			},
		})
		if (room.count === 0)
			return;
		await this.gameService.startGame(roomId);
	}

	async prepareMatch (userId: number, socketId: string, mode: MatchMode): Promise<Match> {
		console.log("mode: ", mode);
		console.log("socketId: ", socketId);
		console.log("userId: ", userId);


		switch (mode){

			case MatchMode.QUICK:
				return (this.prepareQuickMatch(userId, socketId));

			case MatchMode.CPU:
				return (this.prepareCpuMatch(userId, socketId));
	
			case MatchMode.FRIENDS:
				return (this.prepareFriendsMatch(userId, socketId));
			default:
				throw new NotFoundException("Mode not found!"); 
		}
	}
}