import { IsEmail, ValidationArguments } from "class-validator";

export class ForgotPasswordDto {
    @IsEmail(
        {},
        {
            message: (args: ValidationArguments) => {
                if (typeof args.value == "undefined" || args.value == "") {
                    return `Email ID is required.`;
                } else {
                    return "Enter valid email address.";
                }
            }
        }
    )
    public email: string;
}