import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  /**
   * Nama pengguna yang unik
   * @example eru_chitanda32
   */
  @IsString()
  @IsOptional()
  username?: string;

  /**
   * Nama depan pengguna
   * @example Chitanda
   */
  @IsString()
  @IsOptional()
  firstname?: string;

  /**
   * Nama belakang pengguna
   * @example Eru
   */
  @IsString()
  @IsOptional()
  lastname?: string | null;
}
