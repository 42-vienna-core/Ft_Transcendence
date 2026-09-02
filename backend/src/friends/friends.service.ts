import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { RequestStatus } from "@prisma/client";
import { RoomStatus } from "@prisma/client";
import { EventEmitter2 } from "@nestjs/event-emitter";
import type { friendRequestData } from './interfaces/friend-request-data.interface';


@Injectable()
export class FriendsService {

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly eventEmitter: EventEmitter2,
		private readonly configService: ConfigService,
	) { }

	async sendRequest(senderId: number, receiverId: number) {
		if (senderId === receiverId)
			throw new BadRequestException('You cannot send a request to yourself');
		const first = Math.min(senderId, receiverId);
		const second = Math.max(senderId, receiverId);
		const lockKey = `lock:friend-request:${first}:${second}`;
		const lockId = await this.redisService.acquireLockWithTime(lockKey, 5);
		if (!lockId)
			throw new ConflictException('Friend request already being processed');
		try {
			const check = await this.prismaService.friendsRequest.findUnique({
				where: {
					senderId_receiverId: { senderId, receiverId, }
			},
			})
			if (check) {
				if (check.status === 'PENDING')
					throw new BadRequestException('Request already sent');
				if (check.status === 'ACCEPTED')
					throw new BadRequestException('You are friends already');
				if (check.status === 'REJECTED')
					await this.prismaService.friendsRequest.delete({
						where: { id: check.id },
					});
			}
			const reverse = await this.prismaService.friendsRequest.findUnique({
				where: { senderId_receiverId: { senderId: receiverId, receiverId: senderId } },
			});
			if (reverse?.status === 'PENDING')
				throw new BadRequestException('The user already sent you a request');
			if (reverse?.status === 'ACCEPTED')
				throw new BadRequestException('You are friends already');
			if (reverse?.status === 'REJECTED') {
				await this.prismaService.friendsRequest.delete({
					where: { id: reverse.id },
				});
			}
			const request = await this.prismaService.friendsRequest.create({
				data: {
					senderId,
					receiverId,
				},
				select: {
					id: true,
					sender: {
						select: {
							id: true,
							name: true,
							avatar: true,
							score: true,
						},
					},
				},
			}).catch ((error: unknown) => {
				if (typeof error === 'object' && error != null && 'code' in error && error.code === 'P2002'){
					throw new ConflictException('Friend request already exists');
				}
				throw error;
			});
			const avatarsUrl = this.configService.getOrThrow<string>('AVATARS_URL')
			const senderStatus = await this.redisService.isOnline(senderId);
			const data : friendRequestData = {
				receiverId,
				request: {
					id: request.id,
					sender: {
						id: senderId,
						name: request.sender.name,
						isOnline: senderStatus,
						score: request.sender.score,
						avatar: request.sender.avatar ? avatarsUrl + request.sender.avatar : null,
					}
				}
			}
			this.eventEmitter.emit('friend-request.received', data);
			return {id: request.id};
		}
		finally {
			await this.redisService.releaseLock(lockKey, lockId);
		}
	}

	async acceptRequest(userId: number, requestId: string) {
		const updated = await this.prismaService.friendsRequest.updateMany({
			where: { 
				id: requestId,
				receiverId: userId,
				status: 'PENDING',
			},
			data: {
				status: 'ACCEPTED',
			},
		});
		if (updated.count !== 1)
			throw new ConflictException('Friend request already processed');
		return { success: true };
	}

	async rejectRequest(userId: number, requestId: string) {
		const updated = await this.prismaService.friendsRequest.updateMany({
			where: { 
				id: requestId,
				receiverId: userId,
				status: 'PENDING',
			},
			data: {
				status: 'REJECTED',
			},
		});
		if (updated.count !== 1)
			throw new ConflictException('Friend request already processed');
		return { success: true };
	}

	async getFriends(userId: number) {
		const requests = await this.prismaService.friendsRequest.findMany({
			where: {
				status: 'ACCEPTED',
				OR: [
					{ senderId: userId },
					{ receiverId: userId },
				],
			},
			include: {
				sender: {
					select: {
						id: true,
						name: true,
						avatar: true,
						score: true,
					},
				},
				receiver: {
					select: {
						id: true,
						name: true,
						avatar: true,
						score: true,
					},
				},
			}
		});
		const list = requests.map(r => {
			if (r.senderId === userId)
				return r.receiver;
			else
				return r.sender;
		});
		const avatarsUrl = this.configService.getOrThrow<string>('AVATARS_URL')
		const friends = await Promise.all(
			list.map(async (user) => ({
				...user,
				avatar: user.avatar ? avatarsUrl + user.avatar : null,
				isOnline: await this.redisService.isOnline(user.id),
			})),
		);
		return friends;
	}

	async removeFriend(userId: number, friend: number) {
		const request = await this.prismaService.friendsRequest.deleteMany({
			where: {
				status: 'ACCEPTED',
				OR: [
					{ senderId: userId, receiverId: friend },
					{ senderId: friend, receiverId: userId },
				],
			},
		});
		if (request.count === 0)
			throw new ConflictException('Friend request does not exist');
		return { success: true };
	}

	async incomingRequest(userId: number) {
		const requests = await this.prismaService.friendsRequest.findMany({
			where: {
				status: 'PENDING',
				receiverId: userId,
			},
			include: {
				sender: {
					select: {
						id: true,
						name: true,
						avatar: true,
						score: true,
					}
				}
			}
		});
		const avatarsUrl = this.configService.getOrThrow<string>('AVATARS_URL')
		const users = await Promise.all(
			requests.map(async (request) => ({
				...request,
				sender: {
					...request.sender,
					avatar: request.sender.avatar
						? avatarsUrl + request.sender.avatar
						: null,
					isOnline: await this.redisService.isOnline(request.sender.id),
				},
			})),
		);
		return users;
	}

	async cancelRequest(userId: number, receiverId: number) {
		const request = await this.prismaService.friendsRequest.deleteMany({
			where: {
				senderId: userId,
				receiverId: receiverId,
				status: 'PENDING',
			},
		});
		if (request.count !== 1)
			throw new ConflictException('Friend request already processed');
		return { success: true };
	}

	async areFriends(userId: number, friendId: number) : Promise<boolean>{
		const friendship = await this.prismaService.friendsRequest.findFirst({
			where: {
				status: RequestStatus.ACCEPTED,
				OR: [{
					senderId: userId,
					receiverId: friendId,
				},{
					senderId: friendId,
					receiverId: userId,
				},],
			},
		});
		if (!friendship)
			return false;
		return true;
	}

	async getPlayingFriends(userId: number){
		const friends = await this.getFriends(userId);
		const friendIds = friends.filter((friend) => friend.isOnline).map((friend) => friend.id);
		if(friendIds.length === 0)
			return [];
		const rooms = await this.prismaService.gameRoom.findMany({
			where: {
				roomUsers: {
					some: {
						userId: {
							in: friendIds,
						},
					},
				},
				OR: [
					{
						status: {
							in: [
								RoomStatus.PLAYING,
								RoomStatus.READY,
							],
						},
					},
					{
						status: RoomStatus.WAITING,
						waitTimeout: {
							gt: new Date(),
						}
					}
				],
			},
			select: {
				id: true,
				status: true,
				type: true,
				maxUsers: true,
				waitTimeout: true,
				roomUsers: {
					where: {
						userId: {
							in: friendIds,
						},
					},
					select: {
						userId: true,
					},
				},
			},
		});
		return rooms;
	}
}
