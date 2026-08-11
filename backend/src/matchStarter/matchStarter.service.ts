import { RoomStatus, RoomType } from "@prisma/client";
import { PrismaService } from '../prisma/prisma.service';
import { GameRoomService } from "src/gameRoom/gameRoom.service";
import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { MatchMode, MatchRequestDto } from "./dto/match.dto";
import { GameService } from "src/game/game.service";
import { RedisService } from "src/redis/redis.service";
import { FriendsService } from "src/friends/friends.service";

const EXP_TIME = 15_000;

export interface Match{
	roomId: string;
	roomStatus: RoomStatus;
	players: number;

	invitation?: {
		friendId: number;
		expiresAt: number;
	};
}

@Injectable()
export class MatchStarter {

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly gameRoom: GameRoomService,
		private readonly gameService: GameService,
		private readonly redisService: RedisService,
		private readonly friendsService: FriendsService,
	){}

	async prepareCpuMatch(userId: number, socketId: string) : Promise<Match>{
		const room = await this.prismaService.gameRoom.create({
			data: {
				name: 'User vs CPU',
				ownerId: userId,
				type: RoomType.PRIVATE,
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
		//const user = await this.prismaService.users.findUnique({where: {id: userId}});
		for (let retry = 0; retry < 3; retry++){
			let room = await this.prismaService.gameRoom.findFirst({
				where: {
					status: RoomStatus.WAITING,
					type: RoomType.PUBLIC
				},
			})
			if (!room){
				const waitTimeout = new Date(Date.now() + EXP_TIME);
				room = await this.prismaService.gameRoom.create({
					data: {
						name: 'Quick Match',
						type: RoomType.PUBLIC,
						status: RoomStatus.WAITING,
						waitTimeout,
					},
				});
				const roomId = room.id;
				setTimeout(() => {void this.finishWaitingTime(roomId)}, EXP_TIME);
				//if (user)
				//	console.log(user.name, ' has created a room');
			}
			let players = await this.gameRoom.getPlayerCount(room.id);
			if (players >= room.maxUsers){
				await this.prismaService.gameRoom.update({
					where: {id:room.id},
					data: { status: RoomStatus.READY}
				})
				continue ;
			}
			if (room.waitTimeout === null || room.waitTimeout <= new Date())
				continue ;
			await this.gameRoom.addUserToRoom(room.id, userId, socketId);
			//if (user)
			//	console.log(user.name, ' has joined a room');
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
	
	async createFriendsMatch(userId: number, socketId: string, friendId: number): Promise<Match> {
		if (userId === friendId)
			throw new BadRequestException('You cannot send a request to yourself');

		if (!await this.friendsService.areFriends(userId, friendId))
			throw new BadRequestException('You can only invite friends');
		
		const isOnline = await this.redisService.isOnline(friendId);
		if (!isOnline)
			throw new BadRequestException('Your firend isn`t online anymore');

		const activeRoom = await this.gameRoom.findActiveRoomWithUser(friendId);
		if (activeRoom)
			throw new BadRequestException('Your friend is already active in another game, retry later');
		
		const waitTimeout = new Date(Date.now() + EXP_TIME);

		const room = await this.prismaService.gameRoom.create({
			data: {
				name: 'Friends match',
				ownerId: userId,
				type: RoomType.FRIEND,
				status: RoomStatus.WAITING,
				waitTimeout,
				roomUsers: {
					create: {
						userId: userId,
						socketId: socketId,
					}
				}
			}
		});

		//send request to friend (60 sec expiry)
		await this.redisService.setEx(`match-invite:${room.id}:${friendId}`, 60, JSON.stringify({
				roomId: room.id,
				inviterId:userId,
				friendId,
				expiresAt: waitTimeout.getTime(),
			}),
		);
		setTimeout(() => {void this.finishWaitingTime(room.id)}, EXP_TIME);
		
		const players = await this.gameRoom.getPlayerCount(room.id);

		return {
			roomId: room.id,
			roomStatus: room.status,
			players: players,
			invitation: {
				friendId,
				expiresAt: waitTimeout.getTime(),
			},
		};
	}
	
	async joinFriendsMatch(userId: number, socketId: string, roomId: string): Promise<Match> {
		const room = await this.prismaService.gameRoom.findUnique({
			where: {id: roomId}
		})
		if (!room)
			throw new BadRequestException('Room not found');

		if (room.type != RoomType.FRIEND)
			throw new BadRequestException('Room not open for friends');

		if (room.status != RoomStatus.WAITING)
			throw new BadRequestException('It is too late to join this room, the match has already started');

		if (room.waitTimeout === null || room.waitTimeout <= new Date())
			throw new BadRequestException('Waiting time has expired');

		if (room.ownerId === null)
			throw new BadRequestException('Room has no owner');

		if (room.ownerId !== userId && !await this.friendsService.areFriends(userId, room.ownerId))
			throw new BadRequestException('You are not friend with the owner of this room');

		let players = await this.gameRoom.getPlayerCount(room.id);
		if (players >= room.maxUsers)
			throw new BadRequestException('Room already full');
		await this.gameRoom.addUserToRoom(room.id, userId, socketId);
		players = await this.gameRoom.getPlayerCount(room.id);
		let status : RoomStatus = room.status;
		if (players >= room.maxUsers){
			await this.prismaService.gameRoom.update({
				where: {id:room.id},
				data: { status: RoomStatus.READY}
			})
			status = RoomStatus.READY;
		};

		return {
			roomId: room.id,
			roomStatus: status,
			players: players,
		};
	}

	async finishWaitingTime(roomId: string) {
		const room = await this.prismaService.gameRoom.findUnique({
			where: {id: roomId},
		})
		if (!room || room.status !== RoomStatus.WAITING)
			return ;
		if (room.waitTimeout === null || room.waitTimeout > new Date())
			return ;
		const players = await this.gameRoom.getPlayerCount(room.id);
		if (players <= 1){
			await this.prismaService.gameRoom.deleteMany({
				where: {
					id: roomId,
					status: RoomStatus.WAITING,
				},
			});
		//	console.log ('Room has been deleted as nobody joined')
			return;
		}
		const ready = await this.prismaService.gameRoom.updateMany({
				where: {
					id: roomId,
					status: RoomStatus.WAITING,
				},
				data: {
					status: RoomStatus.READY,
				},
		});
		//console.log ('Room status: ', ready.status)

		if (ready.count > 0)
			await this.startMatch(roomId);
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

	async prepareMatch (userId: number, socketId: string, request: MatchRequestDto): Promise<Match> {
		console.log("mode: ", request.mode);
		console.log("socketId: ", socketId);
		console.log("userId: ", userId);

		const activeRoom = await this.gameRoom.findActiveRoomWithUser(userId);
		if (activeRoom)
			throw new BadRequestException('You are already active in another game, retry later');
		

		switch (request.mode){

			case MatchMode.QUICK:
				return (this.prepareQuickMatch(userId, socketId));

			case MatchMode.CPU:
				return (this.prepareCpuMatch(userId, socketId));
			
			case MatchMode.FRIEND_INV:
				if (request.friendId === undefined)
					throw new BadRequestException('friendId is required')
				return (this.createFriendsMatch(userId, socketId, request.friendId));
	
			case MatchMode.FRIEND_JOIN:
				if (request.roomId === undefined)
					throw new BadRequestException('roomId is required')
				return (this.joinFriendsMatch(userId, socketId, request.roomId));
		
			default:
				throw new NotFoundException("Mode not found!");
		}
	}
}