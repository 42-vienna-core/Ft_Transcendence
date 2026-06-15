import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
//import { CreateFriendDto } from './dto/create-friend.dto';
//import { UpdateFriendDto } from './dto/update-friend.dto';

@Injectable()
export class FriendsService {

	public constructor(
		private readonly prismaService: PrismaService,
	) { }
  
  	async sendRequest(senderId: number, receiverId: number){
		const request = await this.prismaService.friendsRequest.create({
			data: {
				senderId,
				receiverId,
			},
			select: {
				id:true,
			}
		});
		return request;
  	}

	async acceptRequest(userId: number, requestId: string){
		const request = await this.prismaService.friendsRequest.findUniqueOrThrow({
			where: {id: requestId,},
		})
		if (request.receiverId !== userId) {
    		throw new BadRequestException('You are not the receiver of this request');
  		}
		await this.prismaService.friendsRequest.update({
			where: {
				id : requestId,
			},
			data: {
				status : 'ACCEPTED',
			},
		});
		return { success: true };
	}

	async rejectRequest(userId: number, requestId: string){
		const request = await this.prismaService.friendsRequest.findUniqueOrThrow({
			where: {id: requestId,},
		})
		if (request.receiverId !== userId) {
    		throw new BadRequestException('You are not the receiver of this request');
  		}
		await this.prismaService.friendsRequest.update({
			where: {
				id : requestId,
			},
			data: {
				status : 'REJECTED',
			},
		});
		return { success: true };
	}

	async getFriends(userId: number){
		const requests = await this.prismaService.friendsRequest.findMany({
			where: {
				status : 'ACCEPTED',
				OR: [
					{senderId: userId},
					{receiverId: userId},
				],
			},
		});
		const list = requests.map(r => {
			if (r.senderId == userId)
				return r.receiverId;
			else
				return r.senderId;
		});
		return list;
	}

	async removeFriend(userId: number, friend: number){
		const request = await this.prismaService.friendsRequest.findFirstOrThrow({
			where: {
				status : 'ACCEPTED',
				OR: [
					{senderId: userId, receiverId: friend},
					{senderId: friend, receiverId: userId},
				],
			},
		});
		await this.prismaService.friendsRequest.delete({
			where: {
				id : request.id,
			},
		});
		return { success: true };
	}

	async incomingRequest(userId: number){
		const requests = await this.prismaService.friendsRequest.findMany({
			where: {
				status : 'PENDING',
				receiverId: userId,
			},
		});
		return requests;
	}
	
	// async outgoingRequests(userId: number){
	// 	const requests = await this.prismaService.friendsRequest.findMany({
	// 		where: {
	// 			status : 'PENDING',
	// 			senderId: userId,
	// 		},
	// 	});
	// 	return requests;
	// }
	
	async cancelRequest(userId: number, receiverId: number){
		const request = await this.prismaService.friendsRequest.findFirstOrThrow({
			where : {
				status : 'PENDING',	
				senderId :userId ,
				receiverId : receiverId,
			},
		});
		await this.prismaService.friendsRequest.delete({
			where: {
				id : request.id,
			},
		});
		return { success: true };
	}

	//get online friends
}
