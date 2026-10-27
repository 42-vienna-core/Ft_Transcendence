import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { AVATAR_UPLOAD_DIR } from './avatar/file/file.service';

const port = Number(process.env.PORT);
const prefix = process.env.API_PREFIX as string;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

async function bootstrap() {
  // Without nginx in front (Render deploy), the app must create and serve
  // the avatars directory itself instead of relying on a bind-mounted volume.
  mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
  mkdirSync(join(process.cwd(), 'uploads/avatars'), { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.set('trust proxy', 1);
  app.useStaticAssets(AVATAR_UPLOAD_DIR, { prefix: '/avatars/' });

  app.setGlobalPrefix(prefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());
  await app.listen(port, '0.0.0.0');
  
}
bootstrap();
