import { IsString, IsEmail, IsNotEmpty, IsNumber, IsArray, IsMobilePhone, IsOptional } from 'class-validator';

export class UserDto {

  @IsNotEmpty()
  public username: string;

  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @IsString()
  public password: string;

  @IsNotEmpty()
  @IsNumber()
  public userType: number;

  @IsNotEmpty()
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsMobilePhone()
  public mobileNumber: string;

  @IsNumber()
  @IsOptional()
  public tenantId: number;
}
