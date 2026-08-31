import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

	async acceptRequest(userId: number, requestId: string) {
		const request = await this.prismaService.friendsRequest.findUnique({
			where: { id: requestId, },
		})
		if (!request)
			throw new NotFoundException('Request not found');
		if (request.receiverId !== userId)
			throw new BadRequestException('You are not the receiver of this request');
		if (request.status !== 'PENDING')
			throw new BadRequestException('Request is not pending');
		await this.prismaService.friendsRequest.update({
			where: {
				id: requestId,
			},
			data: {
				status: 'ACCEPTED',
			},
		});
		return { success: true };
	}

	async rejectRequest(userId: number, requestId: string) {
		const request = await this.prismaService.friendsRequest.findUnique({
			where: { id: requestId, },
		})
		if (!request)
			throw new NotFoundException('Request not found');
		if (request.receiverId !== userId)
			throw new BadRequestException('You are not the receiver of this request');
		if (request.status !== 'PENDING')
			throw new BadRequestException('Request is not pending');
		await this.prismaService.friendsRequest.update({
			where: {
				id: requestId,
			},
			data: {
				status: 'REJECTED',
			},
		});
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
		const request = await this.prismaService.friendsRequest.findFirst({
			where: {
				status: 'ACCEPTED',
				OR: [
					{ senderId: userId, receiverId: friend },
					{ senderId: friend, receiverId: userId },
				],
			},
		});
		if (!request)
			throw new NotFoundException('Request not found');
		await this.prismaService.friendsRequest.delete({
			where: {
				id: request.id,
			},
		});
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
		const request = await this.prismaService.friendsRequest.findFirst({
			where: {
				status: 'PENDING',
				senderId: userId,
				receiverId: receiverId,
			},
		});
		if (!request)
			throw new NotFoundException('Request not found');
		await this.prismaService.friendsRequest.delete({
			where: {
				id: request.id,
			},
		});
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
