import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

//* decorator Global digunakan agar prisma dapat diakses oleh semua module tanpa
//* harus menyertakan nya di setiap properti provider pada setiap module
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
