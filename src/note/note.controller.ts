import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { GetQueryParams, GetUser } from '../common/decorators';
import { CreateNoteDto, UpdateNoteDto } from './dto';

@Controller('notes')
export class NoteController {
  constructor(private noteService: NoteService) {}

  @Get()
  fetchNotes(
    @GetUser('id') userId: string,
    @GetQueryParams('noteId') noteId: string,
  ) {
    return this.noteService.getNotesOneOrMore(userId, noteId);
  }

  @Post()
  createNote(@GetUser('id') userId: string, @Body() dto: CreateNoteDto) {
    return this.noteService.createNote(userId, dto);
  }

  @Patch()
  updateNoteById(
    @GetUser('id') userId: string,
    @GetQueryParams('noteId') noteId: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.noteService.updateNoteById(userId, noteId, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNoteById(
    @GetUser('id') userId: string,
    @GetQueryParams('noteId') noteId: string,
  ): Promise<void> {
    await this.noteService.deleteNoteById(userId, noteId);
  }
}
