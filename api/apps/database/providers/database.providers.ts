import { createConnection } from 'typeorm';
import { Note } from '../../note/note.entity';
import { User } from '../../user/user.entity';

export const databaseProviders = [
  {
    provide: 'PG_DATABASE_CONNECTION',
    useFactory: async () =>
      await createConnection({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: 'markdocs_db',
        synchronize: true,
        logging: false,
        entities: [User, Note],
        migrations: ['../pg/migration/**/*.ts'],
        subscribers: ['../pg/subscriber/**/*.ts'],
        cli: {
          entitiesDir: '../pg/entity',
          migrationsDir: '../pg/migration',
          subscribersDir: '../pg/subscriber',
        },
      }),
  },
];
