import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { GenerateTokensOutput, TokenService } from './token.service';
import { User } from '../users/entities/user.entity';
import { EncryptService } from '../common/encrypt.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly encryptService: EncryptService,
  ) {}

  async signIn(email: string, password: string) {
    const user: User | null = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException();

    const passwordMatch = await this.encryptService.compare(
      password,
      user.password,
    );

    if (!passwordMatch) throw new UnauthorizedException();

    return await this.tokenService.generationTokens(
      user.id,
      user.role,
      user.tokenVersion,
    );
  }

  async RefreshToken(refreshToken: string): Promise<GenerateTokensOutput> {
    const { isValid, payload } = await this.tokenService.validateToken(
      refreshToken,
      'refresh',
    );

    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const { sub, tokenVersion, role } = payload;

    return await this.tokenService.generationTokens(sub, role, tokenVersion);
  }
}
