//import {  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameState, Direction, Snake, Position, Food } from './interfaces/game-state';



function newHeadPosition(state: GameState) : GameState{
	//for each snake
		//check if next direction is not opposite
		//if dir is opposite
			//new dir == dir
		//update new head position
	return state;
}

function checkCollision(state: GameState) : GameState{
	//for each snake
		//check new head position
		//if wall or other snake body
			//update alive false
	return state;
}

function checkFood(state: GameState) : GameState{
	//for each alive snake
		//for each food
			//if new head position == food position
				//cur snake will grow === true 
				//update score
				//delete current food
				//create random position new food
	return state;
}

function moveSnake(state: GameState) : GameState{
	//for each alive snake
		//if alive
			//move head
			//cut tail if needed
			//update direction
			//null new direction
			//new position null
			//will grow false
	return state;
}



@Injectable()
export class Game {

	public constructor(
		private readonly prismaService: PrismaService,
	) { };
	startGame(roomId: string){
		void roomId;
		//retrieve game state
	}
	tick(roomId: string){
		void roomId;
	}

	//tick
}