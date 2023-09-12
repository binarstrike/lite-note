import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { EnvConfigType } from 'src/types';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private config: ConfigService<EnvConfigType, true>) {
    const url = config.get<string>('DATABASE_URL');
    super({
      datasources: {
        db: { url },
      },
    });
  }
  /**
   * sebuah fungsi untuk menghapus semua record pada database saat melakukan pengujian pada aplikasi
   * @returns
   */
  async cleanDb(): Promise<void> {
    const env = this.config.get<EnvConfigType['NODE_ENV']>('NODE_ENV');
    if (env === 'production') return;
    await this.$transaction([this.user.deleteMany(), this.note.deleteMany()]);
  }
}
