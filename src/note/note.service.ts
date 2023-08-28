import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto } from './dto';
import { NoteWithoutUserId } from 'src/types';
import { ExcludePropWithType } from 'src/helpers';
import { Note } from '@prisma/client';

const prismaSelectNoteFields: ExcludePropWithType<Note, 'userId', boolean> = {
  id: true,
  title: true,
  description: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class NoteService {
  constructor(private prisma: PrismaService) {}

  async getNotes(userId: string, noteId?: string): Promise<NoteWithoutUserId[]> {
    try {
      if (noteId) {
        const note = await this.prisma.note.findFirstOrThrow({
          where: { userId, id: noteId },
          select: prismaSelectNoteFields,
        });
        return [note];
      }
      const notes = await this.prisma.note.findMany({
        where: { userId },
        select: prismaSelectNoteFields,
      });
      return notes;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Catatan tidak ditemukan');
      }
      throw new ForbiddenException();
    }
  }

  async createNote(userId: string, dto: CreateNoteDto): Promise<NoteWithoutUserId> {
    try {
      const note = await this.prisma.note.create({
        data: { userId, ...dto },
        select: prismaSelectNoteFields,
      });
      return note;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Catatan tidak ditemukan');
      }
      throw new ForbiddenException();
    }
  }

  async updateNoteById(userId: string, noteId: string, dto: UpdateNoteDto): Promise<NoteWithoutUserId> {
    try {
      const note = await this.prisma.note.findUniqueOrThrow({
        where: { id: noteId },
      });

      if (!note || note.userId !== userId)
        throw new ForbiddenException('Catatan tidak ditemukan atau tidak bisa diakses');

      const updateNote = await this.prisma.note.update({
        where: { id: noteId },
        data: dto,
        select: prismaSelectNoteFields,
      });

      return updateNote;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Catatan tidak ditemukan');
      }
      throw new ForbiddenException();
    }
  }

  async deleteNoteById(userId: string, noteId: string): Promise<void> {
    try {
      const note = await this.prisma.note.findUniqueOrThrow({
        where: { id: noteId },
      });

      if (!note || note.userId !== userId)
        throw new ForbiddenException('Catatan tidak ditemukan atau tidak bisa diakses');

      const deleteNote = await this.prisma.note.delete({
        where: { id: noteId },
      });

      if (!deleteNote) throw new ForbiddenException();
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Catatan tidak ditemukan');
      }
      throw new ForbiddenException();
    }
  }
}
