import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserController } from './user/user.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { EnvParsedConfig } from './config';
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
  ],
  //* namun jika ada controller tanpa module maka bisa langsung memasukan nya ke
  //* properti controllers pada root/app module
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
