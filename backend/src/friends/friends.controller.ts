import { Controller, Post, HttpCode, HttpStatus, Body, Get, Patch, Param, Delete, ParseUUIDPipe, ParseIntPipe } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { Authorization } from '../common/decorators/authorization.decorator';
import { Authorized } from '../common/decorators/authorized.decorator';
import { FriendRequestDto } from './dto/friend-request.dto';


@Controller('friends')
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) { }

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Post('request')
	async sendRequest(@Authorized('userId') senderId: number, @Body() dto: FriendRequestDto) {
		return this.friendsService.sendRequest(senderId, dto.receiverId);
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Patch('request/:id/accept')
	async acceptRequest(@Authorized('userId') userId: number, @Param('id', new ParseUUIDPipe({version: '4'})) requestId: string,) {
		return this.friendsService.acceptRequest(userId, requestId);
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Patch('request/:id/reject')
	async rejectRequest(@Authorized('userId') userId: number, @Param('id', new ParseUUIDPipe({version: '4'})) requestId: string,) {
		return this.friendsService.rejectRequest(userId, requestId);
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Delete('request')
	async cancelRequest(@Authorized('userId') userId: number, @Body() dto: FriendRequestDto) {
		return this.friendsService.cancelRequest(userId, dto.receiverId);
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Get('')
	async getFriends(@Authorized('userId') userId: number) {
		return this.friendsService.getFriends(userId);
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Delete(':friendId')
	async removeFriend(@Authorized('userId') userId: number, @Param('friendId', ParseIntPipe) friendId: number) {
		return this.friendsService.removeFriend(userId, friendId);
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Get('request/incoming')
	async incomingRequest(@Authorized('userId') userId: number) {
		return this.friendsService.incomingRequest(userId);
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Get('playing')
	async getPlayingFriends(@Authorized('userId') userId: number){
		return this.friendsService.getPlayingFriends(userId);
	}
}