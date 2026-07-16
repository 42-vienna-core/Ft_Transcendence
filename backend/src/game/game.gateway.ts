import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody} from '@nestjs/websockets';
import { Server} from 'socket.io';
import type { changeDirectionPayload } from "./interfaces/events";
import { RedisService } from "../redis/redis.service";
import { GameState } from './interfaces/game-state';


@WebSocketGateway()
export class GameGateway {
	@WebSocketServer() server!: Server;
	
	constructor(private readonly redisService: RedisService){}

	@SubscribeMessage('change-direction')
	async handleChangeDirection(@MessageBody() data: changeDirectionPayload,){
		const game = await this.redisService.getGameState(data.roomId);
		if (!game)
			return {success: false};
		const snake = game.snakes.find(s => s.id === data.userId);
		if (!snake)
			return {success: false};
		snake.newDirection = data.direction;
		await this.redisService.setGameWithTTL(game.roomId, game);

		return {success: true};
	}

	async broadcastGameState(roomId: string, state: GameState){
		this.server.to(roomId).emit('game-state', state);
	}
}