import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Put,
} from '@nestjs/common';
import { FindByUuidDto } from 'apps/dto/find-by-uuid.dto';
import { ReadUserDto } from './dto/read-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('id/:id')
  public async getUser(@Param() findByUuid: FindByUuidDto) {
    try {
      if (!(await this.userService.existById(findByUuid.id))) {
        return new HttpException('User Not Found', 404);
      }

      const user = await this.userService.findById(findByUuid.id);
      const readUser = new ReadUserDto();
      readUser.email = user.email;
      readUser.firstName = user.firstName;
      readUser.lastName = user.lastName;
      return readUser;
    } catch (error) {
      console.log(error);
      return new HttpException('Server Error', 500);
    }
  }

  @Put()
  public async updateUser(
    @Param() findByUuid: FindByUuidDto,
    @Body() user: UpdateUserDto,
  ) {
    try {
      if (!(await this.userService.existById(findByUuid.id))) {
        return new HttpException('User Not Found', 404);
      }

      await this.userService.update(findByUuid.id, user);

      return { valid: true };
    } catch (error) {
      console.log(error);
      return new HttpException('Server Error', 500);
    }
  }

  @Delete()
  public async deleteUser(@Param() findByUuid: FindByUuidDto) {
    try {
      if (!(await this.userService.existById(findByUuid.id))) {
        return new HttpException('User Not Found', 404);
      }

      await this.userService.delete(findByUuid.id);

      return { valid: true };
    } catch (error) {
      console.log(error);
      return new HttpException('Server Error', 500);
    }
  }
}
