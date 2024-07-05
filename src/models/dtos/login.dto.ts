import { IsString, IsEmail, IsNotEmpty, IsNumberString, IsNumber } from 'class-validator';

export class LoginOTPDto {

  @IsString()
  public countryCode: string;

  @IsString()
  public username: string;

  @IsString()
  public password: string;
}

export class ForgotPasswordDto {

  @IsString()
  public username: string;
}

export class ResetPasswordDto {

  @IsString()
  public password: string;

  @IsNumberString()
  public otp: string;
}

