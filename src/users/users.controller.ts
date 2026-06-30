import { Controller, Post, Body, Res, UseGuards, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.gaurd';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.usersService.create(createUserDto);

    const { password, ...userWithoutPassword } = user;

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.EXPIRES_ACCESS_TOKEN) * 60 * 1000,
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.EXPIRES_REFRESH_TOKEN) * 60 * 1000,
    });

    return { message: 'User created successfully!', userWithoutPassword };
  }

  @Get()
  async findByEmail(@Body('email') email: string) {
    const user = await this.usersService.findByEmail(email);

    return user;
  }
}
