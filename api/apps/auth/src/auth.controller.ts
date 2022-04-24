import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { CreateUserDto } from 'apps/user/dto/create-user.dto';
import { UserService } from 'apps/user/user.service';
import { LoginUserDto } from 'apps/user/dto/login-user.dto';
import { LoggedUserDto } from 'apps/user/dto/logged-user.dto';
import { Request } from 'express';

@Controller('auth/user')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('v1/register')
  public async register(@Body() user: CreateUserDto) {
    try {
      if (await this.userService.existByEmail(user.email)) {
        return new HttpException('User already exist', 409);
      }

      await this.userService.create(user);
      return { valid: true };
    } catch (error) {
      console.log(error);
      return new HttpException('Server Error', 500);
    }
  }

  @Post('v1/login')
  public async login(
    @Body() credentials: LoginUserDto,
  ): Promise<LoggedUserDto | Error> {
    try {
      const userExist = await this.userService.existByEmail(credentials.email);

      if (userExist) {
        const logged = await this.userService.login(
          credentials.email,
          credentials.password,
        );
        if (logged) {
          const user = await this.userService.findByEmail(credentials.email);
          const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
          const loggedUser: LoggedUserDto = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token,
          };

          return loggedUser;
        }

        return new HttpException('Credentials Dont Match', 401);
      }

      return new HttpException('User Not Found', 404);
    } catch (error) {
      console.log(error);
      return new HttpException('Server Error', 500);
    }
  }

  @Get('v1/validate')
  public async validateToken(@Req() req: Request) {
    try {
      jwt.verify(
        req.headers.authorization.split(' ')[1],
        process.env.JWT_SECRET,
      );

      return { valid: true };
    } catch (error) {
      return { valid: false };
    }
  }
}
