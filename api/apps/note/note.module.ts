import { Module } from '@nestjs/common';
import { DatabaseModule } from 'apps/database/database.module';
import { UserModule } from 'apps/user/user.module';
import { noteProvider } from './note.provider';
import { NoteService } from './note.service';

@Module({
  imports: [DatabaseModule, UserModule],
  providers: [...noteProvider, NoteService],
  exports: [NoteService],
})
export class NoteModule {}
