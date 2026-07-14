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
	roomId: string;
	userId: number;
}