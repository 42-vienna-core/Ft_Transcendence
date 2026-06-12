import { Controller, Post, HttpCode, HttpStatus, Body, Patch, Param } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { Authorization } from '../common/decorators/authorization.decorator';
import { Authorized } from '../common/decorators/authorized.decorator';


@Controller('friends')
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) {}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Post('request')
	async sendRequest(
		@Authorized('userId') senderId: number, 
		@Body('receiverId') receiverId: number,) {
				return this.friendsService.sendRequest(senderId, receiverId);
		}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Patch('request/:id/accept')
	async acceptRequest(
		@Authorized('userId') userId: number,
		@Param("id") requestId: string,
	){
		return this.friendsService.acceptRequest(userId, requestId);
	}
	//patch - reject
	//delete  -cancel request
	//get - get friends
	//delete - friend
	//get - request incoming
}