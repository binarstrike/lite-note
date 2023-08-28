import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateNoteDto {
  @ApiProperty({ description: 'Judul catatan', example: 'Pergi ke minimarket' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Deskripsi catatan', example: 'Beli susu bubuk coklat 50 kotak' })
  @IsString()
  @IsOptional()
  description?: string;
}
