import { ApiProperty } from '@nestjs/swagger';

export class NotesResponseSchema {
  @ApiProperty({ description: 'Judul catatan', example: 'Pergi ke pasar' })
  title: string;

  @ApiProperty({
    description: 'deskripsi catatan untuk memperjelas apa yang akan dicatat',
    example: 'Beli bawang putih 150kg',
  })
  description: string;

  @ApiProperty({ description: 'Id catatan', example: '5d4e5f3a8c7b6e001d2f1a8b' })
  id: string;

  @ApiProperty({ description: 'Waktu pertama kali catatan dibuat' })
  createdAt: Date;

  @ApiProperty({ description: 'Waktu terakhir kali catatan diperbarui' })
  updatedAt: Date;
}
