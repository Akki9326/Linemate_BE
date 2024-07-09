import { IsString, IsEmail, IsNotEmpty, IsNumberString, IsNumber, MinLength, Matches } from 'class-validator';

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

  @IsNotEmpty({ message: "Password is required." })
  @MinLength(8, { message: "Password length cannot be less than 8 characters. " })
  @Matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
    message: "Password must be at least 8 characters including 1 upper case letter, 1 lower case letter, 1 number and 1 special character.",
  })
  password: string;

  @IsNumberString()
  public otp: string;
}

