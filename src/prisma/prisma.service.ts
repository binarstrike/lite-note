import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { EnvConfigType } from '../config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService<EnvConfigType>) {
    super({
      datasources: {
        db: { url: config.get('DATABASE_URL') },
      },
    });
  }
  /**
   * sebuah fungsi untuk membersihkan database digunakan saat melakukan testing pada aplikasi
   * @returns
   */
  cleanDb() {
    return this.$transaction([this.user.deleteMany(), this.note.deleteMany()]);
  }
}
