import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { EnvParsedConfig } from './config';
import { UserModule } from './user/user.module';
import { NoteModule } from './note/note.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './common/guards';
// import { AuthService } from './auth/auth.service';

//* karena AuthService merupakan bagian dari AuthModule jadi cukup dengan
//* import module nya saja

@Module({
  //* jika mengimport suatu module maka setiap endpoint controller pada
  //* module tersebut akan ter mapping ke root endpoint
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => EnvParsedConfig],
    }),
    AuthModule,
    PrismaModule,
    UserModule,
    NoteModule,
  ],
  //* namun jika ada controller tanpa module maka bisa langsung memasukan nya ke
  //* properti controllers pada root/app module
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
