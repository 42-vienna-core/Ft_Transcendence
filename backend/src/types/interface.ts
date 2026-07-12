export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
	x: number;
	y: number;
}

export interface OnlineUsersData {
	id: number;
	Username: string;
	role: string;
	history: {
		gamesWon: number;
		gamesLost: number;
		totalScore: number;
	}
}

export interface Snake {
	userId: number; //user id
	body: Position[]; //first position 
	direction: Direction;
	newDirection: Direction | null;
	newPosition: Position | null;
	willGrow: boolean;
	alive: boolean;
	score: number;
	color: string;
}

export interface Food {
	position: Position;
	//type: 'normal' | 'big' | 'huge';
}

export interface GameState {
	roomId: string;
	snakes: Snake[];
	food: Food[];
	status: 'waiting' | 'countdown' | 'running' | 'finished';
	tick: number;
	gridWidth: number;
	gridHeight: number;
	winnerId: number | null;
}

export interface User {
	id: number;
	Email: string;
	Password: string;
	Username: string;
	role: string;
}

export function CreateSnake (userId: number) {
	return {
		userId: userId,
		body: [],
		direction: 'LEFT',
		newDirection: null,
		newPosition: null,
		willGrow: false,
		alive: true,
		score: 0,
		color: "",
	}
}