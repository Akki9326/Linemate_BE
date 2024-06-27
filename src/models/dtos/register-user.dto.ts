import { IsString, IsEmail, IsNotEmpty, IsNumber, IsArray, IsMobilePhone } from 'class-validator';

export class RegisterUserDto {

  @IsNotEmpty()
  public username: string;

  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @IsString()
  public password: string;

  @IsNotEmpty()
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsMobilePhone()
  public mobileNumber: string;

  @IsArray()
  public roleIds: number[];

  @IsArray()
  public organisationIds: number[];
}
