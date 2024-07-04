import { IsArray, IsEmail, IsMobilePhone, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserDto {

  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsEmail()
  public email: string;

  @IsNumber()
  public userType: number;

  @IsMobilePhone()
  public mobileNumber: string;


  @IsArray()
  @IsOptional()
  public tenantIds: number[];
}

export class AdminDto {

  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsEmail()
  public email: string;

    @IsMobilePhone()
  public mobileNumber: string;  

  @IsString()
  public password: string;

}


