import { notes } from 'test/notes.json';

export function getRandomNote(): typeof notes extends Array<infer U> ? U : never {
  return notes[~~(Math.random() * notes.length)];
}
