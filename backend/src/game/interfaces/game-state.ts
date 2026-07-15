export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
	x: number;
	y: number;
}

export interface Snake {
	id: number; //user id
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
	eaten: boolean;
}

export interface GameState {
	roomId: string;
	snakes: Snake[];
	food: Food[];
	status: 'waiting' | 'running' | 'finished';
	tick: number;
	gridWidth: number;
	gridHeight: number;
	winnerId: number | null;
}