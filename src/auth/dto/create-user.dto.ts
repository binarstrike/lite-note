import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  /**
   * Nama pengguna yang unik
   * @example michael_ucup16
   */
  @IsNotEmpty()
  @IsString()
  username: string;

  /**
   * Mama depan pengguna
   * @example Michael
   */
  @IsNotEmpty()
  @IsString()
  firstname: string;

  /**
   * Nama belakang pengguna
   * @example Ucup
   */
  @IsOptional()
  @IsString()
  lastname?: string;

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
