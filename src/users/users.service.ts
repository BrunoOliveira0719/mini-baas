import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import type { IUsersRepository } from './users.repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: IUsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.usersRepository.findByEmail(
      createUserDto.email,
    );

    if (userExists != null) {
      throw new ConflictException('User with this email already exists');
    }

    return this.usersRepository.create(createUserDto);
  }
}
