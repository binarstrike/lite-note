import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { EnvParsedConfig as config } from './config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //* fungsi .enableVersioning() memberikan versi pada API seperti /v1/users/me, /v2/auth/signin
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: config.DEFAULT_API_VERSION });
  //* cors berguna agar API terlindungi dari request API oleh websites yang tidak dikenal
  app.enableCors({ origin: config.CORS_ORIGINS });
  //* module helmet berguna untuk keamanan API dengan menambahkan header khusus pada API
  app.use(helmet({ contentSecurityPolicy: false }));
  //* pipe yang di set secara global, ValidationPipes digunakan untuk menyaring payload pada request ke API dan
  //* validasi terhadap payload agar jika terdapat kesalahan pada payload maka akan mengembalikan respon error
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  //* top middleware, cookie parser digunakan untuk mengkonversi cookie yang datang dari request menjadi object
  app.use(cookieParser());
  await app.listen(config.SERVER_PORT);
}
bootstrap();
