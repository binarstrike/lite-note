import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { EnvConfigType } from 'src/config';

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
   * sebuah fungsi untuk membersihkan database digunakan saat melakukan testing pada aplikasi
   * @returns
   */
  async cleanDb() {
    const env = this.config.get<EnvConfigType['NODE_ENV']>('NODE_ENV');
    //* agar muncul autocomplete pada saat pengecekan environment/lingkungan dimana aplikasi berjalan.
    //* inisialisasi terlebih dahulu ke sebuah variabel
    if (env === 'production') return;
    //* sehingga dapat meminimalisir kesalahan pengetikan.
    //* pengecekan ini dilakukan untuk mencegah database terhapus secara tidak sengaja pada production environment.
    //* atau juga bisa menggunakan type casting jika env tidak diberi generic type secara eksplisit
    //* if ((env as EnvConfigType['NODE_ENV']) === 'production') return;
    await this.$transaction([this.user.deleteMany(), this.note.deleteMany()]);
  }
}
