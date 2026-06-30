import { validate } from 'class-validator';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from './dtos/signIn.dto';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dtos/RefreshToken.dto';

@Controller('auth')
export class AuthenticationController {
  private accessTokenCookieName: string;
  private refreshTokenCookieName: string;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenCookieName = this.configService.getOrThrow<string>(
      'ACCESS_TOKEN_COOKIE_NAME',
    );
    this.refreshTokenCookieName = this.configService.getOrThrow<string>(
      'REFRESH_TOKEN_COOKIE_NAME',
    );
  }

  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = signInDto;

    const { accessToken, refreshToken } =
      await this.authenticationService.signIn(email, password);

    response.cookie(this.accessTokenCookieName, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.EXPIRES_ACCESS_TOKEN) * 60 * 1000,
    });

    response.cookie(this.refreshTokenCookieName, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.EXPIRES_REFRESH_TOKEN) * 60 * 1000,
    });

    return { message: 'Signed in successfully!' };
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookie = request.cookies as Record<string, string | undefined>;

    const rawToken = cookie[this.refreshTokenCookieName];

    if (!rawToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const token = new RefreshTokenDto();
    token.refreshToken = rawToken;

    const errors = await validate(token);

    if (errors.length > 0)
      throw new BadRequestException('The refresh token must be a valid JWT');

    const { accessToken, refreshToken } =
      await this.authenticationService.RefreshToken(token.refreshToken);

    response.cookie(this.accessTokenCookieName, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.EXPIRES_ACCESS_TOKEN) * 60 * 1000,
    });

    response.cookie(this.refreshTokenCookieName, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.EXPIRES_REFRESH_TOKEN) * 60 * 1000,
    });

    return { message: 'Refresh Tokens in successfully!' };
  }
}
