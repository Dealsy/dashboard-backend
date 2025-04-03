import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints;
          return Object.values(constraints || {}).join(', ');
        });
        return new BadRequestException(messages.join('; '));
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
