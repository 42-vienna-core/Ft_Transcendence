import { RoomStatus, RoomType } from "@prisma/client";
import { PrismaService } from '../prisma/prisma.service';
import { GameRoomService } from "src/gameRoom/gameRoom.service";
import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { MatchMode, MatchRequestDto } from "./dto/match.dto";
import { GameService } from "src/game/game.service";
//import { RedisService } from "src/redis/redis.service";
import { FriendsService } from "src/friends/friends.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { setTimeout as wait } from 'node:timers/promises';

const EXP_TIME = 20_000;
const COUNTDOWN = 3; // seconds

export interface Match{
	roomId: string;
	roomStatus: RoomStatus;
	timer: number | null;
	players: {
		id: number;
		name: string;
		avatar: string | null;
		isOwner: boolean;
	}[] | null;
}


@Injectable()
export class MatchStarter {

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly gameRoom: GameRoomService,
		private readonly gameService: GameService,
		//private readonly redisService: RedisService,
		private readonly friendsService: FriendsService,
		private readonly eventEmitter: EventEmitter2,
	){}

	async returnPlayers(roomId: string) {
		const participants = await this.prismaService.roomUser.findMany({
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
		const res = participants.map(({user, room}) => ({
			...user,
			isOwner: user.id === room.ownerId,
		}));
		return res;
	}

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

		return {
			roomId: room.id,
			roomStatus: ready.status,
			players: null,
			timer: null
		};
	}

	async prepareQuickMatch(userId: number, socketId: string) : Promise<Match>{
		for (let retry = 0; retry < 3; retry++){
			let room = await this.prismaService.gameRoom.findFirst({
				where: {
					status: RoomStatus.WAITING,
					type: RoomType.PUBLIC,
					waitTimeout:{
						gt: new Date(),
					}
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
						ownerId: userId,
					},
				});
				const roomId = room.id;
				setTimeout(() => {void this.finishWaitingTime(roomId)}, EXP_TIME);
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

			players = await this.gameRoom.getPlayerCount(room.id);
			let status = room.status;
			if (players >= room.maxUsers){
				await this.prismaService.gameRoom.update({
					where: {id:room.id},
					data: { status: RoomStatus.READY}
				})
				status = RoomStatus.READY;
			}

			const participants = await this.returnPlayers(room.id);

			let timer = null;
			if (room.waitTimeout != null)
				timer = room.waitTimeout.getTime();
			return {
				roomId: room.id,
				roomStatus: status,
				players: participants,
				timer,
			};
		}
		throw new ServiceUnavailableException('Could not find room, try again');
	}
	
	async createFriendsMatch(userId: number, socketId: string): Promise<Match> {
		
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
		setTimeout(() => {void this.finishWaitingTime(room.id)}, EXP_TIME);
		this.eventEmitter.emit('friend-match.created', {ownerId: userId, roomId: room.id});
		this.eventEmitter.emit('playing-friends.changed', {ownerId: room.ownerId});

		const players = await this.returnPlayers(room.id);

		let timer = null;
		if (room.waitTimeout != null)
			timer = room.waitTimeout.getTime();
		return {
			roomId: room.id,
			roomStatus: room.status,
			players,
			timer,
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
		this.eventEmitter.emit('playing-friends.changed', {ownerId: room.ownerId});
		
		const participants = await this.returnPlayers(room.id);

		let timer = null;
		if (room.waitTimeout != null)
			timer = room.waitTimeout.getTime();
		return {
			roomId: room.id,
			roomStatus: status,
			players: participants,
			timer,
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
			const owner = room.ownerId;
			const type = room.type;
			const deleted = await this.prismaService.gameRoom.deleteMany({
				where: {
					id: roomId,
					status: RoomStatus.WAITING,
				},
			});
			if (deleted.count > 0 && owner !== null && type === RoomType.FRIEND)
				this.eventEmitter.emit('playing-friends.changed', {ownerId: owner});
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
		this.eventEmitter.emit('match.countdown', {roomId: roomId, countdown: COUNTDOWN});
		await wait(COUNTDOWN * 1000);
		
		//console.log ('Room status: ', ready.status)
		
		if (ready.count > 0){
			if (room.ownerId !== null && room.type === RoomType.FRIEND)
				this.eventEmitter.emit('playing-friends.changed', {ownerId: room.ownerId});
			await this.startMatch(roomId);
		}
	}

	async startMatch(roomId: string){
		const updated = await this.prismaService.gameRoom.updateMany({
			where: {
				id: roomId,
				status: RoomStatus.READY,
			},
			data: {
				status: RoomStatus.PLAYING,
			},
		})
		 
		if (updated.count === 0)
			return;
		const room = await this.prismaService.gameRoom.findUnique({
			where: { id: roomId }
		});
		if (room && room.ownerId && room.type === RoomType.FRIEND)
			this.eventEmitter.emit('playing-friends.changed', {ownerId: room.ownerId});
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
			
			case MatchMode.FRIENDS:
				return (this.createFriendsMatch(userId, socketId));
	
			case MatchMode.FRIENDS_JOIN:
				if (request.roomId === undefined)
					throw new BadRequestException('roomId is required')
				return (this.joinFriendsMatch(userId, socketId, request.roomId));
		
			default:
				throw new NotFoundException("Mode not found!");
		}
	}
}