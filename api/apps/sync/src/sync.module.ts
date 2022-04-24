import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NoteModule } from 'apps/note/note.module';
import { UserModule } from 'apps/user/user.module';
import { SyncGateway } from './sync.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/sync.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    NoteModule,
    UserModule,
  ],
  controllers: [],
  providers: [SyncGateway],
})
export class SyncModule {}
