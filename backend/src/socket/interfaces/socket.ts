import { Socket } from 'socket.io';

export type SocketResponse< T = undefined>= | {
	success: true;
	data?: T;
} | {
	success: false;
	error: string;
}

interface AuthenticatedSocketData {
	userId?: number;
	sessionId?: string;
	user?: {
		id: number;
		[key: string]: unknown;
	};
	roomId?: string;
}

export type AuthenticatedSocket = Socket<
	any,
	any,
	any,
	AuthenticatedSocketData
>;