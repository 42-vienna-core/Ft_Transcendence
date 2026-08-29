import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from "@nestjs/common";
import { RoomStatus } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { MatchStarter } from "./matchStarter.service";

const CLOSE_ROOMS = 5_000

@Injectable()
export class RoomCleanUpService implements OnApplicationBootstrap, OnModuleDestroy{

	private roomTimer?: ReturnType<typeof setInterval>;

	constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly starterService: MatchStarter,
	){}

	async onApplicationBootstrap() {
		await this.cleanupRooms();
		this.roomTimer = setInterval(() => {this.cleanUpExpiredRooms()}, CLOSE_ROOMS);
	}

	async onModuleDestroy() {
		if (this.roomTimer)
			clearInterval(this.roomTimer);
	}

	private async cleanupRooms(){
		const activeRooms = await this.prismaService.gameRoom.findMany({
			where: {
				status: {
					in: [
						RoomStatus.WAITING,
						RoomStatus.PLAYING,
						RoomStatus.READY,
					],
				},
			},
			select: {id: true},
		});
		if (activeRooms.length === 0)
			return;
		const roomIds = activeRooms.map((room) => room.id);

		await this.prismaService.$transaction([
			this.prismaService.gameRoom.updateMany({
				where: {
					id: {
						in: roomIds,
					}
				},
				data: {
					status: RoomStatus.ABANDONED,
				},
			}),
			this.prismaService.roomUser.deleteMany({
				where: {
					roomId: {
						in: roomIds,
					},
				}
			})
		]);
		await Promise.all(roomIds.map((roomId) => this.redisService.deleteGameState(roomId)));
	}

	private async cleanUpExpiredRooms(){
		const expiredRooms = await this.prismaService.gameRoom.findMany({
			where: {
				status: RoomStatus.WAITING,
				waitTimeout:{ lte: new Date() },
			},
			select: {id: true},
		});
		await Promise.all(expiredRooms.map((room) => this.starterService.finishWaitingTime(room.id)));
	}
}