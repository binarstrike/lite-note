import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { EnvParsedConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //* mencegah adanya properti lain yang tidak ada pada dto di request payload
    }),
  );
  await app.listen(EnvParsedConfig.SERVER_PORT);
}
bootstrap();
