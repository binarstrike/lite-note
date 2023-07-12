import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto } from './dto';
import { Note } from '@prisma/client';

const selectNoteQueryProp: Record<keyof Omit<Note, 'userId'>, boolean> = {
  id: true,
  title: true,
  description: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class NoteService {
  constructor(private prisma: PrismaService) {}

  async getNotes(userId: string) {
    const notes = await this.prisma.note.findMany({
      where: { userId },
      select: selectNoteQueryProp,
    });
    return notes;
  }

  async createNote(userId: string, createNote: CreateNoteDto) {
    const note = await this.prisma.note.create({
      data: { userId, ...createNote },
      select: selectNoteQueryProp,
    });
    return note;
  }

  async getNoteById(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { userId, id: noteId },
      select: selectNoteQueryProp,
    });
    return note;
  }

  async updateNoteById(
    userId: string,
    noteId: string,
    updateNote: UpdateNoteDto,
  ) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note || note.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.note.update({
      where: { id: noteId },
      data: { ...updateNote },
    });
  }

  async deleteNoteById(userId: string, noteId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note || note.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.note.delete({
      where: { id: noteId },
    });
  }
}
