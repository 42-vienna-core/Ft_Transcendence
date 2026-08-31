import { ArgumentsHost, Catch, HttpException, Logger, WsExceptionFilter } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import type { Socket } from "socket.io"
import type { SocketResponse } from "../interfaces/socket";

@Catch()
export class SocketExceptionFilter implements WsExceptionFilter{
	private readonly logger = new Logger(SocketExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) : void {
		const client = host.switchToWs().getClient<Socket>();
		let message = 'Unexpected socket error';

		if (exception instanceof WsException){
			const error = exception.getError();
			if (typeof error === 'string')
				message = error;
		}
		else if (exception instanceof HttpException)
			message = exception.message;
		else
			this.logger.error(exception);

		const response: SocketResponse = {success: false, error: message};
		client.emit('exception', response);		
	}
}