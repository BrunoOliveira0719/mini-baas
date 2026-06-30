import { IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @IsJWT({ message: 'The refresh token must be a valid JWT' })
  refreshToken!: string;
}
