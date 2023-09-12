import { Note } from '@prisma/client';
import { ExcludeProp } from 'src/helpers';

export type NoteQueryParamType = {
  noteId: string;
};

export type NoteWithoutUserId = ExcludeProp<Note, 'userId'>;

export const noteQueryParamName: Record<Uppercase<keyof NoteQueryParamType>, keyof NoteQueryParamType> = {
  NOTEID: 'noteId',
};
