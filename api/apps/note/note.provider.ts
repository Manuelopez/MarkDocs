import { Connection } from 'typeorm';
import { Note } from './note.entity';

export const noteProvider = [
  {
    provide: 'NOTE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Note),
    inject: ['PG_DATABASE_CONNECTION'],
  },
];
