import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserLoginDto {
  /**
   * Email pengguna
   * @example anyemail123@xyz.com
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * Kata sandi pengguna
   */
  @IsNotEmpty()
  @IsString()
  password: string;
}
