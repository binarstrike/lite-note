import { Note } from '@prisma/client';
import { ExcludeProp } from '../helpers';

export type NoteParamsEndpoint = {
  noteId: string;
};

export type PrismaSelectNoteFieldsType = ExcludeProp<Note, 'userId'>;

export const prismaSelectNoteFields: Record<
  keyof PrismaSelectNoteFieldsType,
  boolean
> = {
  id: true,
  title: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} as const;
