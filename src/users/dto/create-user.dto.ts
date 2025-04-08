import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  /**
   * User's name
   * @example "John Doe"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

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
