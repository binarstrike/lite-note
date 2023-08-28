import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ description: 'Judul catatan', example: 'Pergi ke minimarket' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Deskripsi catatan', example: 'Beli susu bubuk coklat 50 kotak' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
