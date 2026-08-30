export type SocketResponse< T = undefined>  = | {
	success: true;
	data?: T;
} | {
	success: false;
	error: string;
}