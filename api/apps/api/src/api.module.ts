import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'apps/guard/auth.guard';
import { NoteController } from 'apps/note/note.controller';
import { NoteModule } from 'apps/note/note.module';
import { UserController } from 'apps/user/user.controller';
import { UserModule } from 'apps/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/api.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    NoteModule,
    UserModule,
  ],
  controllers: [UserController, NoteController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class ApiModule {}
