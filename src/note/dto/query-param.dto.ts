import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class NoteQueryParamSchema {
  @IsString()
  @IsMongoId()
  @IsOptional()
  noteId: string;
}
