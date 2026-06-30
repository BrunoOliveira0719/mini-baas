import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: 'The email must be a valid email address' })
  email!: string;

  @IsString({ message: 'The password must be a string' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol',
    },
  )
  password!: string;
}
