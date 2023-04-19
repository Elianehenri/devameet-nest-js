/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],//controlar o nivel de logs impresso no console
  });

  app.enableCors();//permite que cadastre os dominios liberados 

  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  //setar as requisiçoes com prefixo /api
  app.setGlobalPrefix('api');

  //await app.listen(3000);
  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
