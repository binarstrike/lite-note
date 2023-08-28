export class UserInfoResponseSchema {
  /**
   * Nama pengguna yang unik
   * @example michael_ucup16
   */
  username: string;

  /**
   * Mama depan pengguna
   * @example Michael
   */
  firstname: string;

  /**
   * Nama belakang pengguna
   * @example Ucup
   */
  lastname: string | null;

  /**
   * Email pengguna
   * @example anyemail123@xyz.com
   */
  email: string;

  /**
   * Waktu pertama kali pengguna registrasi atau dibuat
   */
  createdAt: Date;

  /**
   * Waktu terakhir kali data atau informasi pengguna diperbarui
   */
  updatedAt: Date;
}
