import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(LoggerService));
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: 'http://localhost:3000',
    Credential: false,
  });
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap()
  .then((res) => console.log(res))
  .catch((erro) => console.log(erro));
