import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto } from './dto';
import { PrismaSelectNoteFieldsType, prismaSelectNoteFields } from '../types';

@Injectable()
export class NoteService {
  constructor(private prisma: PrismaService) {}

  async getNotes(
    userId: string,
    noteId?: string,
  ): Promise<PrismaSelectNoteFieldsType | PrismaSelectNoteFieldsType[]> {
    try {
      if (noteId) {
        const note = await this.prisma.note.findFirstOrThrow({
          where: { userId, id: noteId },
          select: prismaSelectNoteFields,
        });
        return note;
      }
      const notes = await this.prisma.note.findMany({
        where: { userId },
        select: prismaSelectNoteFields,
      });
      return notes;
    } catch (_) {
      throw new NotFoundException();
    }
  }

  async createNote(userId: string, dto: CreateNoteDto): Promise<PrismaSelectNoteFieldsType> {
    const note = await this.prisma.note.create({
      data: { userId, ...dto },
      select: prismaSelectNoteFields,
    });
    return note;
  }

  async updateNoteById(userId: string, noteId: string, dto: UpdateNoteDto) {
    try {
      const note = await this.prisma.note.findUniqueOrThrow({
        where: { id: noteId },
      });

      if (!note || note.userId !== userId) throw new ForbiddenException('Access to resources denied');

      const updateNote = await this.prisma.note.update({
        where: { id: noteId },
        data: { ...dto },
      });

      return updateNote;
    } catch (_) {
      throw new NotFoundException();
    }
  }

  async deleteNoteById(userId: string, noteId: string): Promise<void> {
    try {
      const note = await this.prisma.note.findUniqueOrThrow({
        where: { id: noteId },
      });

      if (!note || note.userId !== userId) throw new ForbiddenException('Access to resources denied');

      const deleteNote = await this.prisma.note.delete({
        where: { id: noteId },
      });

      if (!deleteNote) throw new ForbiddenException();
    } catch (_) {
      throw new NotFoundException();
    }
  }
}
