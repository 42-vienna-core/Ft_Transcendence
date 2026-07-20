import { Injectable, BadRequestException, Inject, forwardRef} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameState, Direction, Snake, Position, Food, Player, PlayerType } from './interfaces/game-state';
import { RedisService } from 'src/redis/redis.service';
import { GameGateway } from './game.gateway';
import { AiBotService } from 'src/aiOpponent/ai.service';
import { RoomStatus } from 'prisma/generated';

const GRID_WIDTH = 40;
const GRID_HEIGHT = 30;
const TICK_MS = 150;

function isOppositeDir(next: Direction | null, cur: Direction) : boolean{
	if (next === null)
		return true;
	if (next === 'DOWN' && cur === 'UP')
		return true;
	if (next === 'UP' && cur === 'DOWN')
		return true;
	if (next === 'LEFT' && cur === 'RIGHT')
		return true;
	if (next === 'RIGHT' && cur === 'LEFT')
		return true;
	return false;
}

function comparePosition(a: Position, b: Position): boolean{
	return (a.x === b.x && a.y === b.y);
}

function spawnFood(state: GameState){
	let ok : boolean = false;
	let pos : Position = {x: 0, y: 0};
	while (!ok){
		pos = {
 			x : Math.floor(Math.random() * state.gridWidth),
			y : Math.floor(Math.random() * state.gridHeight),
		};
		ok = true;
		for (const food of state.food){
			if (comparePosition(food.position, pos)){
				ok = false;
				break;
			}
		}
		if (!ok)
			continue;
		for (const snake of state.snakes){
			for (const body of snake.body)
				if (comparePosition(body, pos)){
					ok = false;
					break;
				}
		}
		//EDGE CASE: check that food is reachable (dead snake)
	}
	state.food.push({position: pos, eaten: false});
}

function newHeadPosition(state: GameState){
	for (const snake of state.snakes){
		if (isOppositeDir(snake.newDirection, snake.direction))
			snake.newDirection = snake.direction;
		snake.newPosition = {x: snake.body[0].x, y: snake.body[0].y}; 
		if (snake.newDirection === 'UP')
			snake.newPosition.y--;
		else if (snake.newDirection === 'DOWN')
			snake.newPosition.y++;
		else if (snake.newDirection === 'LEFT')
			snake.newPosition.x--;		
		else if (snake.newDirection === 'RIGHT')
			snake.newPosition.x++;
	}
}

function checkFood(state: GameState){
	for (const snake of state.snakes){
		if (snake.alive === false)
			continue;
		if (snake.newPosition === null)
			continue;
		for (const food of state.food){
			if (comparePosition(snake.newPosition, food.position)){
				snake.willGrow = true;
				food.eaten = true;
			}
		}
	}
}

function checkCollision(state: GameState){
	for (const snake of state.snakes){
		if (snake.alive === false)
			continue;
		if (snake.newPosition === null)
			continue;
		let x = snake.newPosition.x;
		let y = snake.newPosition.y;
		if (x < 0 || x >= state.gridWidth)
			snake.alive = false;
		if (y < 0 || y >= state.gridHeight)
			snake.alive = false;
		for (const other of state.snakes){
			if (snake.alive === false)
				break;
			if (other !== snake){
				if (other.newPosition != null && comparePosition(other.newPosition, snake.newPosition)){
					other.alive = false;
					snake.alive = false;
					break;
				}
			}
			for (let i = 0; i < other.body.length; i++){
				const pos = other.body[i];
				const last = other.body.length - 1;
				if (comparePosition(pos, snake.newPosition)){
					if (i === last && !other.willGrow){
						continue;
					}
					snake.alive = false;
					break;
				}
			}
		}
	}
}


function updateFoodScore(state: GameState){
	for (let i = 0; i < state.food.length; i++){
		if (state.food[i].eaten){
			state.food.splice(i, 1);
			spawnFood(state);
			i--;
		}
	}
	for (const snake of state.snakes){
		if (!snake.alive)
			continue;
		if (snake.willGrow)
			snake.score++;
	}
}

function moveSnake(state: GameState){
	for (const snake of state.snakes){
		if (!snake.alive)
			continue;
		if (snake.newPosition === null)
			continue;
		snake.body.unshift(snake.newPosition);
		if (!snake.willGrow)
			snake.body.pop();
		if (snake.newDirection !== null)
			snake.direction = snake.newDirection;
		snake.willGrow = false;
		snake.newDirection = null;
		snake.newPosition = null;
	}
}

function createSnake(user: Player, index: number, color: string) : Snake{
	let pos: Position = {x: 2, y: 1};
	const body : Position[]  = [];
	let dir : Direction = 'RIGHT';
	if (index === 2)
		pos = {x: 2, y: GRID_HEIGHT - 2}
	if (index === 1)
		pos = {x: GRID_WIDTH - 3, y: 1}
	if (index === 3)
		pos = {x: GRID_WIDTH - 3, y: GRID_HEIGHT - 2}
	
	if (index === 0 || index === 2){
		body.push(pos);
		body.push({x: pos.x - 1, y: pos.y});
		body.push({x: pos.x - 1, y: pos.y + 1});
	}
	if (index === 1 || index === 3){
		body.push(pos);
		body.push({x: pos.x - 1, y: pos.y});
		body.push({x: pos.x - 1, y: pos.y + 1});
		dir = 'LEFT';
	}
	let player: PlayerType = 'human';
	if (user.isBot)
		player = 'bot';
	const snakes : Snake = {
		id: user.id,
		body: body,
		direction: dir,
		newDirection: null,
		newPosition: null,
		willGrow: false,
		alive: true,
		score: 0,
		color: color,
		player: player,
	};
	return snakes;
}

function initGame(id: string, users: Player[]) : GameState{
	const snakes : Snake[] = [];
	let flag = false;
	const color = ['#00c849', '#00d5ff', '#da0bf5', '#fb7a09'];
	for (let i = 0; i < users.length; i++){
		snakes.push(createSnake(users[i], i, color[i]));
		if (users[i].isBot)
			flag = true;
	}
	const foods : Food[] = [];
	const game : GameState = {
		roomId: id,
		snakes: snakes,
		food: foods,
		status: 'waiting',
		tick: 0,
		gridHeight: GRID_HEIGHT,
		gridWidth: GRID_WIDTH,
		winnerId: null,
		botPresent: flag,
	};
	for (let i = 0; i < users.length + 1; i++)
		spawnFood(game);
	return game;
}

function gameOver(game : GameState) : GameState{
	let alive : number = 0;
	let winners : number[] = [];
	for (const snake of game.snakes){
		if (snake.alive){
			alive++;
			winners.push(snake.id);
		}
	}
	if (alive <= 1){
		game.status = 'finished';
		if (winners.length !== 0)
			game.winnerId = winners[0];
	}
	return game;
}


@Injectable()
export class GameService {

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly aiBotService: AiBotService,
		@Inject(forwardRef(() => GameGateway)) private readonly gameGateway: GameGateway,
	) { };

	async storeResults(game: GameState){
		await this.prismaService.gameResults.create({
			data: {
				roomId: game.roomId,
				winnerId: game.winnerId,
				ticks: game.tick,
				participants: {
					create: game.snakes.map(s=> ({
						userId: s.id,
						score: s.score,
						alive: s.alive,
					}))
				}
			}
		})
		await this.prismaService.gameRoom.update({
			where: {
				id: game.roomId
			},
			data: {
				status: RoomStatus.FINISHED
			},
		});
	}

	async startGame(roomId: string){
		const room = await this.prismaService.gameRoom.findUnique({
			where: { id:roomId },
			include: {
				roomUsers: {
					include: {
						user: {
							select: {
								id:true,
								isBot: true,
							}
						}
					}
				}
			},
		});
		if (!room)
			throw new BadRequestException ('Room not found');
		const users = room.roomUsers.map((roomUser) => ({
			id: roomUser.user.id,
			isBot: roomUser.user.isBot
		}));
		const game : GameState = initGame(roomId, users);
		game.status = 'running';
		await this.redisService.setGameWithTTL(roomId, game);
		this.gameGateway.broadcastGameState(roomId, game);
		setTimeout(() => this.tick(roomId), TICK_MS);
	}

	async tick(roomId: string){
		const game = await this.redisService.getGameState(roomId);
		if (!game)
			return ;
		if (game.status !== 'finished'){
			if (game.botPresent){
				const map = this.aiBotService.createMap(game);
				for (const snake of game.snakes){
					if (snake.alive && snake.player === 'bot')
						snake.newDirection = this.aiBotService.newBotDirection(snake, map);
				}
			}
			newHeadPosition(game);
			checkFood(game);
			checkCollision(game);
			updateFoodScore(game);
			moveSnake(game);
			game.tick++;
			gameOver(game);
		}
		await this.redisService.setGameWithTTL(roomId, game);
		if (game.status === 'finished')
			await this.storeResults(game);
		else{
			setTimeout(() => this.tick(roomId), TICK_MS);
		}
		this.gameGateway.broadcastGameState(roomId, game);
	}
}