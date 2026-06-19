import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IUsersRepository } from './users.repository.interface';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepositoryTypeORM implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
