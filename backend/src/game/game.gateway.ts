import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody} from '@nestjs/websockets';
import { Server} from 'socket.io';
import type { changeDirectionPayload } from "./interfaces/events";
import { RedisService } from "src/redis/redis.service";
import { GameState } from './interfaces/game-state';
import { GameRoomService } from 'src/gameRoom/gameRoom.service';


@WebSocketGateway()
export class GameGateway {
	@WebSocketServer() server!: Server;
	
	constructor(
		private readonly redisService: RedisService,
		private readonly gameRoom: GameRoomService,
	){}

	@SubscribeMessage('change-direction')
	async handleChangeDirection(@MessageBody() data: changeDirectionPayload,){
		const game = await this.redisService.getGameState(data.roomId);
		if (!game)
			return {success: false};
		const snake = game.snakes.find(s => s.id === data.userId);
		if (!snake)
			return {success: false};
		if (!snake.alive)
			return {success: false};
		snake.newDirection = data.direction;
		console.log(data);
		await this.redisService.setGameWithTTL(game.roomId, game);

		return {success: true};
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
