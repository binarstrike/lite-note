import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { NoteService } from './note.service';
import { GetUser } from '../auth/decorator';
import { CreateNoteDto, UpdateNoteDto } from './dto';

@UseGuards(JwtGuard)
@Controller('notes')
export class NoteController {
  constructor(private noteService: NoteService) {}

  @Get()
  getNotes(@GetUser('id') userId: string) {
    return this.noteService.getNotes(userId);
  }

  @Post()
  createNote(@GetUser('id') userId: string, @Body() createNote: CreateNoteDto) {
    return this.noteService.createNote(userId, createNote);
  }

  @Get(':noteId')
  getNoteById(@GetUser('id') userId: string, @Param('noteId') noteId: string) {
    return this.noteService.getNoteById(userId, noteId);
  }

  @Patch(':noteId')
  updateNoteById(
    @GetUser('id') userId: string,
    @Param('noteId') noteId: string,
    @Body() updateNote: UpdateNoteDto,
  ) {
    return this.noteService.updateNoteById(userId, noteId, updateNote);
  }

  @Delete(':noteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteNoteById(
    @GetUser('id') userId: string,
    @Param('noteId') noteId: string,
  ) {
    return this.noteService.deleteNoteById(userId, noteId);
  }
}
