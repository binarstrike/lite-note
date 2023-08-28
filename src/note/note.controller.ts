import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiQuery,
  ApiQueryOptions,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Query } from '@nestjs/common';
import { NoteService } from './note.service';
import { ApiBearerAuthHeader, GetUser } from 'src/common/decorators';
import { CreateNoteDto, NoteQueryParamSchema, UpdateNoteDto } from './dto';
import { NoteWithoutUserId } from 'src/types';
import { NotesResponseSchema } from 'src/swagger-ui/schema';

const noteApiQuerySwaggerOptions: ApiQueryOptions = {
  name: 'noteId',
  description: 'Id catatan berupa ObjectId',
  example: '5d4e5f3a8c7b6e001d2f1a8b',
};

@ApiTags('notes')
@ApiBearerAuthHeader('accessToken')
@Controller('notes')
export class NoteController {
  constructor(private noteService: NoteService) {}

  /**
   * Mengambil satu atau lebih catatan, jika diberi id catatan pada query paramater maka hanya akan
   * mengambil satu catatan berdasarkan id catatan tersebut.
   **/
  @ApiOkResponse({
    description: 'Mengembalikan satu atau banyak catatan dalam bentuk json.',
    type: NotesResponseSchema,
    isArray: true,
  })
  @ApiQuery({ ...noteApiQuerySwaggerOptions, required: false })
  @Get()
  getNotes(
    @GetUser('id') userId: string,
    @Query() queryParam: NoteQueryParamSchema,
  ): Promise<NoteWithoutUserId[]> {
    return this.noteService.getNotes(userId, queryParam.noteId);
  }

  /**
   * Membuat catatan baru.
   */
  @ApiCreatedResponse({
    description: 'Mengembalikan catatan yang telah dibuat dalam bentuk json',
    type: NotesResponseSchema,
  })
  @Post()
  createNote(@GetUser('id') userId: string, @Body() dto: CreateNoteDto): Promise<NoteWithoutUserId> {
    return this.noteService.createNote(userId, dto);
  }

  /**
   * Memperbarui catatan
   */
  @ApiOkResponse({
    description: 'Mengembalikan catatan yang telah diperbarui dalam bentuk json',
    type: NotesResponseSchema,
  })
  @ApiQuery(noteApiQuerySwaggerOptions)
  @Patch()
  updateNoteById(
    @GetUser('id') userId: string,
    @Query() queryParam: NoteQueryParamSchema,
    @Body() dto: UpdateNoteDto,
  ): Promise<NoteWithoutUserId> {
    return this.noteService.updateNoteById(userId, queryParam.noteId, dto);
  }

  /**
   * Menghapus catatan
   */
  @ApiNoContentResponse({
    description: 'jika catatan berhasil dihapus maka tidak akan mengembalikan respons apapun',
  })
  @ApiQuery(noteApiQuerySwaggerOptions)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNoteById(
    @GetUser('id') userId: string,
    @Query() queryParam: NoteQueryParamSchema,
  ): Promise<void> {
    return this.noteService.deleteNoteById(userId, queryParam.noteId);
  }
}
