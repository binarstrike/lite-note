export class AuthTokenResponseSchema {
  /**
   * Token berupa JWT yang digunakan untuk mengakses API.
   */
  accessToken: string;
  /**
   * Token berupa JWT yang digunakan untuk memperbarui access token dan refresh token.
   */
  refreshToken: string;
}
