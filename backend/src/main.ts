import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'https://localhost',
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  
  // ADD '0.0.0.0' HERE
  await app.listen(port, '0.0.0.0'); 
  
  console.log(`Backend running on port ${port} and listening on 0.0.0.0`);
}

bootstrap();
