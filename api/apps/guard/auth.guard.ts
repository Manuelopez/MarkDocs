import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from 'apps/user/user.service';
import { Request } from 'express';
import { decode } from 'jsonwebtoken';
import fetch from 'node-fetch';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const response = await fetch(
      `${process.env.AUTH_URL}/auth/user/v1/validate`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${
            request.headers.authorization.split(' ')[1]
          }`,
        },
      },
    );

    const valid = await response.json();
    if (!valid.valid) {
      return false;
    }
    const decodedUser: any = decode(
      request.headers.authorization.split(' ')[1],
    );
    const user = await this.userService.findById(decodedUser.id);
    request.user = user;

    return true;
  }
}
