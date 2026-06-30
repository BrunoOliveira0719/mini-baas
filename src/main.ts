import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
    credentials: true,
  });

  const configDocs = new DocumentBuilder()
    .setTitle('Mini BaaS API')
    .setDescription('API for Mini BaaS application')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, configDocs);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.SERVER_PORT ?? 3000);
}
bootstrap();
