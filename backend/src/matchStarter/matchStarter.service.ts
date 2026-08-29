import { RoomStatus, RoomType, Prisma } from "@prisma/client";
import { PrismaService } from '../prisma/prisma.service';
import { GameRoomService } from "src/gameRoom/gameRoom.service";
import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { MatchMode, MatchRequestDto } from "./dto/match.dto";
import { GameService } from "src/game/game.service";
import { RedisService } from "src/redis/redis.service";
import { FriendsService } from "src/friends/friends.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { setTimeout as wait } from 'node:timers/promises';
import { Match } from "src/gameRoom/interfaces/room-update.interface";


const EXP_TIME = 20_000;
const COUNTDOWN = 3; // seconds

@Injectable()
export class MatchStarter {

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly gameRoom: GameRoomService,
		private readonly gameService: GameService,
		private readonly redisService: RedisService,
		private readonly friendsService: FriendsService,
		private readonly eventEmitter: EventEmitter2,
	){}

	async removePlayerlock(userId: number, roomId: string){
		const data = await this.prismaService.$transaction(async(transaction) =>{
			await transaction.$queryRaw`SELECT id FROM "GameRoom" WHERE id = ${roomId} FOR UPDATE`;
			const room = await transaction.gameRoom.findUnique({where: {id: roomId}});
			const roomUser = await transaction.roomUser.findUnique({
				where: {
					roomId_userId: {
						roomId,
						userId,
					}
				}
			});

			if (!room || ! roomUser)
				return {abandoned: false, success: false};
			let ownerChange = false;
			if (roomUser.userId === room.ownerId && (room.status === RoomStatus.READY || room.status === RoomStatus.WAITING)){
				if (room.type === RoomType.PUBLIC)
					ownerChange = await this.gameRoom.changeOwner(roomUser.roomId, roomUser.userId, transaction);
				if (!ownerChange){
					await transaction.gameRoom.updateMany({
						where: {id:room.id},
						data: {status: RoomStatus.ABANDONED}
					})
					return {abandoned: true, success: true };
				}
			}
			if (!ownerChange)
				await this.gameRoom.removeUserFromRoom(roomUser.roomId, roomUser.userId, transaction);
			if (room.status === RoomStatus.READY){
				const players = await this.gameRoom.getPlayerCount(room.id, transaction);
				if (players <= 1){
					await transaction.gameRoom.updateMany({
						where: {id:room.id},
						data: {status: RoomStatus.ABANDONED}
					});
					return {abandoned: true, success: true };
				}
			}
			return {abandoned: false, success: true };
		});
		return data;
	}

	async returnPlayers(roomId: string, transaction?: Prisma.TransactionClient) {
		const database = transaction ?? this.prismaService;
		const participants = await database.roomUser.findMany({
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
		const ready = await this.prismaService.gameRoom.updateMany({
			where: {
				id:room.id,
				status: RoomStatus.WAITING
			},
			data: { status: RoomStatus.READY}
		})
		if (ready.count === 0)
			throw new BadRequestException('CPU match cancelled');
		
		const userIds : number[] = [userId];
		this.eventEmitter.emit('playing-friends.changed', {userIds});
		
		const players = await this.returnPlayers(room.id);

		return {
			roomId: room.id,
			roomStatus: RoomStatus.READY,
			players,
			timer: null
		};
	}

	async prepareQuickMatch(userId: number, socketId: string) : Promise<Match>{
		for (let retry = 0; retry < 3; retry++){
			const data = await this.prismaService.$transaction(async(transaction) =>{
				await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('quick-match'))`;
				let newRoom = false;
				let room = await transaction.gameRoom.findFirst({
					where: {
						status: RoomStatus.WAITING,
						type: RoomType.PUBLIC,
						waitTimeout:{
							gt: new Date(),
						}
					},
				})
				if (room){
					const roomId = room.id;
					await transaction.$queryRaw`SELECT id FROM "GameRoom" WHERE id = ${room.id} FOR UPDATE`;
					room = await transaction.gameRoom.findUnique({where: {id: roomId}});
					if (!room || room.status !== RoomStatus.WAITING)
						return null;
				}
				else {
					const waitTimeout = new Date(Date.now() + EXP_TIME);
					room = await transaction.gameRoom.create({
						data: {
							name: 'Quick Match',
							type: RoomType.PUBLIC,
							status: RoomStatus.WAITING,
							waitTimeout,
							ownerId: userId,
						},
					});
					newRoom = true;
				}
				if (room.waitTimeout === null || room.waitTimeout <= new Date())
					return null ;
				let players = await this.gameRoom.getPlayerCount(room.id, transaction);
				if (players >= room.maxUsers){
					await transaction.gameRoom.update({
						where: {id:room.id},
						data: { status: RoomStatus.READY}
					})
					return null ;
				}


				await this.gameRoom.addUserToRoom(room.id, userId, socketId, transaction);
				players = await this.gameRoom.getPlayerCount(room.id, transaction);
				let status = room.status;
				if (players >= room.maxUsers){
					await transaction.gameRoom.update({
						where: {id:room.id},
						data: { status: RoomStatus.READY}
					})
					status = RoomStatus.READY;
				}
				const participants = await this.returnPlayers(room.id, transaction);
				let timer = null;
				if (room.waitTimeout != null)
					timer = room.waitTimeout.getTime();
				return {
					newRoom,
					roomId: room.id,
					roomStatus: status,
					players: participants,
					timer,
				};
			});
			if (!data)
				continue ;
			if (data.newRoom && data.timer){
				const timeLeft = Math.max(0, data.timer - Date.now());
				setTimeout(() => {void this.finishWaitingTime(data.roomId).catch((error) =>
				console.error('Room waiting time failed', error))}, timeLeft);
			}
			const userIds : number[] = [userId];
			this.eventEmitter.emit('playing-friends.changed', {userIds});
			return {
				roomId: data.roomId,
				roomStatus: data.roomStatus,
				players: data.players,
				timer: data.timer,
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
		setTimeout(() => {void this.finishWaitingTime(room.id).catch((error) =>
		console.error('Room timeout failed', error))}, EXP_TIME);
		this.eventEmitter.emit('friend-match.created', {ownerId: userId, roomId: room.id, status: room.status});
		const userIds : number[] = [userId];
		this.eventEmitter.emit('playing-friends.changed', {userIds});

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
		let room = await this.prismaService.gameRoom.findUnique({
			where: {id: roomId}
		});
		if (!room)
			throw new BadRequestException('Room not found');

		if (room.type != RoomType.FRIEND)
			throw new BadRequestException('Room not open for friends');

		if (room.ownerId === null)
			throw new BadRequestException('Room has no owner');

		if (room.ownerId !== userId && !await this.friendsService.areFriends(userId, room.ownerId))
			throw new BadRequestException('You are not friend with the owner of this room');

		const match = await this.prismaService.$transaction(async (transaction) => {
			await transaction.$queryRaw`SELECT id FROM "GameRoom" WHERE id = ${roomId} FOR UPDATE`;
			room = await transaction.gameRoom.findUnique({
				where: {id: roomId}
			});
			if (!room)
				throw new BadRequestException('Room not found');
			if (room.status != RoomStatus.WAITING)
				throw new BadRequestException('It is too late to join this room, the match has already started');
			if (room.waitTimeout === null || room.waitTimeout <= new Date())
				throw new BadRequestException('Waiting time has expired');

			let players = await this.gameRoom.getPlayerCount(room.id, transaction);
			if (players >= room.maxUsers)
				throw new BadRequestException('Room already full');
			await this.gameRoom.addUserToRoom(room.id, userId, socketId, transaction);
			players = await this.gameRoom.getPlayerCount(room.id, transaction);
			let status : RoomStatus = room.status;
			if (players >= room.maxUsers){
				await transaction.gameRoom.update({
					where: {id:room.id},
					data: { status: RoomStatus.READY}
				})
				status = RoomStatus.READY;
			};

			const participants = await this.returnPlayers(room.id, transaction);

			let timer = null;
			if (room.waitTimeout != null)
				timer = room.waitTimeout.getTime();
			return {
				roomId: room.id,
				roomStatus: status,
				players: participants,
				timer,
			};
		});
		if (match.roomStatus === RoomStatus.READY)
			this.eventEmitter.emit('friend-match.status', {ownerId: room.ownerId, roomId: match.roomId, status: match.roomStatus});
		const userIds : number[] = [userId];
		this.eventEmitter.emit('playing-friends.changed', {userIds});

		return match;
	}

	async finishWaitingTime(roomId: string) {
		const data = await this.prismaService.$transaction(async (transaction) => {
			await transaction.$queryRaw`SELECT id FROM "GameRoom" WHERE id = ${roomId} FOR UPDATE`;
			const room = await transaction.gameRoom.findUnique({where: {id: roomId}});
			if (!room || room.status !== RoomStatus.WAITING)
				return null;
			if (room.waitTimeout === null || room.waitTimeout > new Date())
				return null;
			const players = await this.gameRoom.getPlayerCount(room.id, transaction);
			if (players <= 1){
				await transaction.gameRoom.updateMany({
					where: {id:room.id},
					data: {status: RoomStatus.ABANDONED}
				})
				return {
					owner: room.ownerId,
					type: room.type,
					roomId,
					timer: null,
					roomStatus: RoomStatus.ABANDONED,
					players: [],
				};
			}
			const ready = await transaction.gameRoom.updateMany({
				where: {
					id: roomId,
					status: RoomStatus.WAITING,
				},
				data: {
					status: RoomStatus.READY,
				},

			});
			if (ready.count === 0)
				return null;
			const participants = await this.returnPlayers(roomId, transaction);
			return {
				owner: room.ownerId,
				type: room.type,
				roomId,
				timer: null,
				roomStatus: RoomStatus.READY,
				players: participants,
			}
		});
		if (!data)
			return ;
		if (data.roomStatus === RoomStatus.ABANDONED){
			await this.updateAbandonedRoom(data.roomId, true);
			return ;
		}
		if (data.owner != null && data.type === RoomType.FRIEND)
				this.eventEmitter.emit('friend-match.status', {ownerId: data.owner, roomId, status: RoomStatus.READY});
		const match : Match = {
			roomId: data.roomId,
			timer: null,
			roomStatus: RoomStatus.READY,
			players: data.players,
		}
		this.eventEmitter.emit('match.countdown', {countdown: COUNTDOWN, match: match});
		await wait(COUNTDOWN * 1000);
		await this.startMatch(roomId);
	}


	async updateAbandonedRoom(roomId: string, abandoned?: boolean) : Promise<boolean>{
		if (!abandoned){
			const room = await this.prismaService.gameRoom.updateMany({
				where: {
					id: roomId,
					status: {
						in: [
							RoomStatus.WAITING,
							RoomStatus.PLAYING,
							RoomStatus.READY,
						],
					},
				},
					data: {
						status: RoomStatus.ABANDONED,
					},
			});
			if (room.count === 0)
				return false;
		}
		await this.redisService.deleteGameState(roomId);
		const match = await this.gameRoom.getRoomUpdate(roomId);
		const roomSockets = await this.prismaService.roomUser.findMany({
			where: {
				roomId,
				socketId: {
					not: null,
				},
			},
			select: { socketId: true },
		});
		const socketIds = roomSockets.flatMap(({socketId}) => socketId ? [socketId] : []);
		this.eventEmitter.emit('match.abandoned', {match, socketIds});
		const userIds : number[] = [];
		for(const user of match.players)
			userIds.push(user.id);
		await this.gameRoom.removeAllUsersFromRoom(roomId);
		const updated = await this.prismaService.gameRoom.findUnique({
			where: {id: roomId},
			select: {
				id: true,
				ownerId: true,
				type: true,
				status: true,
			}
		})
		if (updated !== null){
			const owner = updated.ownerId;
			const type = updated.type;
			if (owner != null && type === RoomType.FRIEND){
				this.eventEmitter.emit('friend-match.status', {ownerId: updated.ownerId, roomId: updated.id ,status: updated.status});
			}
		}
		this.eventEmitter.emit('playing-friends.changed', {userIds});
		return true;
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
			this.eventEmitter.emit('friend-match.status', {ownerId: room.ownerId, roomId: room.id, status: RoomStatus.PLAYING});
		await this.gameService.startGame(roomId);
	}

	async prepareMatch (userId: number, socketId: string, request: MatchRequestDto): Promise<Match> {
		console.log("mode: ", request.mode);
		console.log("socketId: ", socketId);
		console.log("userId: ", userId);

		const lockKey = `lock:prepare-match:${userId}`;
		const lockId = await this.redisService.acquireLock(lockKey, 30);
		if (!lockId)
			throw new BadRequestException('Another request is bein processed, retry later');
		try{
			const activeRoom = await this.gameRoom.findActiveRoomWithUser(userId);
			if (activeRoom)
				throw new BadRequestException('You are already active in another game, retry later');

			switch (request.mode){

				case MatchMode.QUICK:
					return await (this.prepareQuickMatch(userId, socketId));

				case MatchMode.CPU:
					return await (this.prepareCpuMatch(userId, socketId));

				case MatchMode.FRIENDS:
					return await (this.createFriendsMatch(userId, socketId));
			
				case MatchMode.FRIENDS_JOIN:
					if (request.roomId === undefined)
						throw new BadRequestException('roomId is required')
					return await (this.joinFriendsMatch(userId, socketId, request.roomId));

				default:
					throw new NotFoundException("Mode not found!");
			}
		} finally {
			await this.redisService.releaseLock(lockKey, lockId);
		}
	}
}