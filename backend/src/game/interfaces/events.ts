import {Direction, GameState} from './game-state'

export interface joinRoomPayload { //client to server
	roomId: string;
	userId: number; //or get it from JWT?
}

export interface startGamePayload { //client to server
	roomId: string;
}

export interface changeDirectionPayload { //client to server
	direction: Direction;
}

export interface playerJoinedPayload { //server to client
	userId: number;
	//username needed?
}

export interface gameStartedPayload { //server to client
	gameState: GameState;
}

export interface gameStatePayload { //server to client
	gameState: GameState;
}

export interface gameOverPayload { //server to client
	gameState: GameState;	
}