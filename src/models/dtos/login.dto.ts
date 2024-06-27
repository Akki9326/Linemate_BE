import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {

  @IsEmail()
  public username: string;

  @IsString()
  public password: string;
}
