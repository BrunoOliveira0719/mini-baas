import { forwardRef, Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TokenService } from './token.service';
import { EncryptService } from '../common/encrypt.service';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService, TokenService, EncryptService],
  imports: [
    ConfigModule,
    JwtModule.register({}),
    forwardRef(() => UsersModule),
  ],
  exports: [AuthenticationService, TokenService, AuthenticationModule],
})
export class AuthenticationModule {}
