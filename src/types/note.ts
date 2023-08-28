import { Note } from '@prisma/client';
import { ExcludeProp } from 'src/helpers';

export type NoteQueryParamKeys = 'noteId';

export type NoteWithoutUserId = ExcludeProp<Note, 'userId'>;
