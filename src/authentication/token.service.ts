import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

export interface JwtPayloadData {
  sub: string;
  tokenVersion: number;
  role: string;
}

export interface GenerateTokensOutput {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  private readonly accessTokenSecret: string | undefined;
  private readonly accessTokenExpiresIn: number | undefined;
  private readonly refreshTokenSecret: string | undefined;
  private readonly refreshTokenExpiresIn: number | undefined;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenSecret = this.configService.getOrThrow<string>(
      'JWT_SECRET_ACCESS_TOKEN',
    );
    this.accessTokenExpiresIn = parseInt(
      this.configService.getOrThrow<string>('EXPIRES_ACCESS_TOKEN'),
    );
    this.refreshTokenSecret = this.configService.getOrThrow<string>(
      'JWT_SECRET_REFRESH_TOKEN',
    );
    this.refreshTokenExpiresIn = parseInt(
      this.configService.getOrThrow<string>('EXPIRES_REFRESH_TOKEN'),
    );
  }

  private async generationAccessToken(
    userId: string,
    role: string,
  ): Promise<string> {
    const payload = {
      sub: userId,
      role,
    };

    const token = await this.jwtService
      .signAsync(payload, {
        secret: this.accessTokenSecret,
        expiresIn: this.accessTokenExpiresIn,
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'JWT generation failed';

        throw new BadGatewayException(
          `Failed to generate access token: ${message}`,
        );
      });

    return token;
  }

  private async generationRefreshToken(
    userId: string,
    tokenVersion: number,
  ): Promise<string> {
    const nextTokenVersion = tokenVersion + 1;

    const payload = {
      sub: userId,
      tokenVersion: nextTokenVersion,
    };

    const token = await this.jwtService
      .signAsync(payload, {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiresIn,
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'JWT generation failed';

        throw new BadGatewayException(
          `Failed to generate refresh token: ${message}`,
        );
      });

    return token;
  }

  async generationTokens(
    userId: string,
    role: string,
    tokenVersion: number,
  ): Promise<GenerateTokensOutput> {
    const accessToken = await this.generationAccessToken(userId, role);

    const refreshToken = await this.generationRefreshToken(
      userId,
      tokenVersion,
    );

    return { accessToken, refreshToken };
  }

  async validateToken(
    token: string,
    typeToken: 'access' | 'refresh',
  ): Promise<{ isValid: boolean; payload: JwtPayloadData }> {
    const secret: string | undefined =
      typeToken === 'access' ? this.accessTokenSecret : this.refreshTokenSecret;

    return this.jwtService
      .verifyAsync(token, { secret })
      .then((payload: JwtPayloadData) => {
        return { isValid: true, payload };
      })
      .catch((error: unknown) => {
        if (error instanceof TokenExpiredError) {
          throw new UnauthorizedException(
            `Expired ${typeToken} token: ${error.message}`,
          );
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        throw new UnauthorizedException(
          `Invalid ${typeToken} token: ${errorMessage}`,
        );
      });
  }
}
