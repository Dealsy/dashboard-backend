import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { USER_ROLES } from '../constants';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  role: keyof typeof USER_ROLES = USER_ROLES.USER;
}
