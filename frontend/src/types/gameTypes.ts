export type ControlType = 'arrow' | 'WASD' | 'arrow + WASD';
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null;
export type GameState = 'START' | 'WIN' | 'OVER' | null;
export type GameModeType = 'QUICK' | 'FRIENDS' | 'FRIENDS_JOIN' | 'CPU' | null;
export type RoomStatusType = 'WAITING' | 'READY' | 'PLAYING' | 'FINISHED' | 'ABANDONED' | null;
export type GameStatusType  = 'running' | 'finished' | null;
export type ActiveFilterType = 'All' | 'Online' | 'Playing' | 'Requests';

export const TICK_MS = 130;


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
    status: GameStatusType;
    tick: number;
    gridWidth: number;
    gridHeight: number;
    winnerId: number | null;
    botPresent: boolean;
}

export interface Friend {
    id: number;
    name: string;
    avatar?: string | null;
    isOnline: boolean;
    score: number;
}

export interface RoomData {
    roomId: string;
    roomStatus: RoomStatusType;
    timer: number;
    players: [{
      id: number;
      name: string;
      avatar: string | null;
      isOwner: boolean;
    }];
}

export interface Request {
    id: string;
    sender: {
        id: number;
        name: string;
        avatar?: string | null;
        isOnline: boolean;
        score: number;
    };
}

export interface GameRequestData {
    roomId: string;
    inviter: {
        id: number;
        name: string;
        avatar?: string | null;
    };
}

export interface LeaderboardData{
  id: number,
  name: string,
  avatar: string | null,
  score: number,
  level: number,
  createdAt: Date,
  rank: number,
  totMatches: number,
}

