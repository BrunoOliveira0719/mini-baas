import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';

@Injectable()
export class EncryptService {
  private readonly saltRounds: number;

  constructor(private readonly configService: ConfigService) {
    this.saltRounds = Number(this.configService.getOrThrow('SALT_ROUNDS'));
  }

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
