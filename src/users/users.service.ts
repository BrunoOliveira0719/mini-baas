import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import type { IUsersRepository } from './users.repository.interface';
import { EncryptService } from '../common/encrypt.service';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: IUsersRepository,

    @Inject(forwardRef(() => AuthenticationService))
    private readonly authService: AuthenticationService,

    private readonly encryptService: EncryptService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.usersRepository.findByEmail(
      createUserDto.email,
    );

    if (userExists != null) {
      throw new ConflictException('User with this email already exists');
    }

    const password = createUserDto.password;

    createUserDto.password = await this.encryptService.hash(
      createUserDto.password,
    );

    const user = await this.usersRepository.create(createUserDto);

    const { accessToken, refreshToken } = await this.authService.signIn(
      user.email,
      password,
    );

    return { user, accessToken, refreshToken };
  }

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }
}
