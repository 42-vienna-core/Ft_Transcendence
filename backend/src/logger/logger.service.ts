import { ConsoleLogger, Injectable } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService  extends ConsoleLogger {
    async writeLogToFile(message: string, logContext?: string) {
        const logMessage = `${new Date().toISOString()} - ${logContext ? `[${logContext}] ` : ''}${message}\n`;
        const logFilePath = path.join(__dirname, '..', 'logs', 'app.log');

        try {
            await fsPromises.mkdir(path.dirname(logFilePath), { recursive: true });
            await fsPromises.appendFile(logFilePath, logMessage);
        } catch (error) {
            console.error('Failed to write log to file:', error);
        }
    }
    log (message: any, logContext?: string) {
        this.writeLogToFile(message, logContext);
        super.log(message, logContext);
    }

    error (message: any, trace?: string, errorContext?: string) {
        this.writeLogToFile(message, errorContext);
        super.error(message, trace, errorContext);
    }

    warn (message: any, warnContext?: string) {
        this.writeLogToFile(message, warnContext);
        super.warn(message, warnContext);
    }

    debug (message: any, debugContext?: string) {
        this.writeLogToFile(message, debugContext);
        super.debug(message, debugContext);
    }

    verbose (message: any, verboseContext?: string) {
        this.writeLogToFile(message, verboseContext);
        super.verbose(message, verboseContext);
    }
}
