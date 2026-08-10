export type ControlType = 'arrow' | 'WASD' | 'arrow + WASD';
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null;
export type GameState = 'START' | 'WIN' | 'OVER' | null;
export type GameModeType = 'QUICK' | 'FRIEND' | 'CPU' | null;

// Server tick duration in milliseconds — shared so the match clock (arena-content)
// stays in sync with the animation interpolation step (game-canvas).
export const TICK_MS = 150;


export interface RoomStateType {
    players: number;
    roomId: string;
    roomStatus: string;
}

export interface Position {
    x: number;
    y: number;
}

export interface Snake {
    id: number;
	username: string;
    body: Position[];
    direction: Direction;
    newDirection: Direction | null;
    newPosition: Position | null;
    willGrow: boolean;
    alive: boolean;
    score: number;
    color: string;
    player: 'human' | 'bot';
}

export interface Food {
    position: Position;
    eaten: boolean;
}

export interface Game {
    roomId: string;
    snakes: Snake[];
    food: Food[];
    status: 'waiting' | 'running' | 'finished';
    tick: number;
    gridWidth: number;
    gridHeight: number;
    winnerId: number | null;
    botPresent: boolean;
}

