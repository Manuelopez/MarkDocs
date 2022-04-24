import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from 'apps/user/user.module';
import { DatabaseModule } from 'apps/database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/auth.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    DatabaseModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
