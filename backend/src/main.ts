import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(LoggerService));
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    credentials: false,
  });
  const port = Number(process.env.PORT) || 4000;

  await app.listen(port, '0.0.0.0');
}
bootstrap()
  .then((res) => console.log(res))
  .catch((erro) => console.log(erro));
