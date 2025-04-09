import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  /**
   * User's email
   * @example "jdoe@me.com"
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * User's password
   * @example "password123"
   */
  @IsString()
  @IsNotEmpty()
  password: string;
}
