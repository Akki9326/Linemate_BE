import { IsEmail, ValidationArguments, IsString, IsNumber, IsNotEmpty, MaxLength, MinLength, Matches, Equals } from "class-validator";

export class GetUserByForgotToken {

    @IsNotEmpty({ message: " Reset token is required." })
    @IsString()
    public token: string;

}