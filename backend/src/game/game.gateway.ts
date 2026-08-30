import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket} from '@nestjs/websockets';
import { Server} from 'socket.io';
import { RedisService } from "src/redis/redis.service";
import { GameState } from './interfaces/game-state';
import { GameRoomService } from 'src/gameRoom/gameRoom.service';
import { ChangeDirectionDto } from './dto/change-direction.dto';
import { Socket } from 'socket.io';


@WebSocketGateway()
export class GameGateway {
	@WebSocketServer() server!: Server;
	
	constructor(
		private readonly redisService: RedisService,
		private readonly gameRoom: GameRoomService,
	){}

	@SubscribeMessage('change-direction')
	async handleChangeDirection(@MessageBody() data: ChangeDirectionDto, @ConnectedSocket() client: Socket){
		const roomUser = await this.gameRoom.findBySocketId(client.id);
		if (!roomUser || roomUser.userId !== client.data.userId)
			return {success: false};
		const lockKey = `lock:game:${roomUser.roomId}`;
		const lockId = await this.redisService.acquireLockWithTime(lockKey, 2);
		if (!lockId)
			return {success: false};
		try {
			const game = await this.redisService.getGameState(roomUser.roomId);
			if (!game)
				return {success: false};
			const snake = game.snakes.find(s => s.id === roomUser.userId);
			if (!snake)
				return {success: false};
			if (!snake.alive)
				return {success: false};
			snake.newDirection = data.direction;
			await this.redisService.setGameWithTTL(game.roomId, game);
			return {success: true};
		} finally {
			await this.redisService.releaseLock(lockKey, lockId);
		}
	}

	async broadcastGameState(roomId: string, state: GameState){
		this.server.to(roomId).emit('game-state', state);
	}

	async broadcastOnlineUsers(){
		const onlineUsers = await this.redisService.getOnlineUsers();
		this.server.emit('online-users', onlineUsers);
	}

	async broadcastRoomUpdate(roomId: string){
		const match = await this.gameRoom.getRoomUpdate(roomId);
		this.server.to(roomId).emit('room-update', match);
	}
}
