import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
  ) {}

  public async create(userData: CreateUserDto) {
    const user = new User();
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.email = userData.email;

    const hashedPassword = bcrypt.hashSync(userData.password, 8);
    user.password = hashedPassword;

    await this.userRepository.save(user);

    return true;
  }

  public async existByEmail(email: string) {
    return (await this.userRepository.findOne({ email })) ? true : false;
  }

  public async existById(id: string) {
    return (await this.userRepository.findOne({ id })) ? true : false;
  }

  public async findById(id: string) {
    return await this.userRepository.findOne({ id });
  }

  public async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email: email } });
  }

  public async login(email: string, password: string) {
    const user = await this.findByEmail(email);

    const isUser = await bcrypt.compare(password, user.password);

    if (isUser) {
      return true;
    }
    return false;
  }

  public async update(id: string, updatedUser: UpdateUserDto) {
    const user = await this.findById(id);
    user.firstName = updatedUser.firstName;
    user.lastName = updatedUser.lastName;
    user.email = updatedUser.email;
    await this.userRepository.save(user);
  }

  public async delete(id: string) {
    await this.userRepository.delete(id);
  }
  async sharedNotes(id: string) {
    return await this.userRepository.findOne({
      where: { id: id },
      relations: ['sharedNotes'],
    });
  }
}
