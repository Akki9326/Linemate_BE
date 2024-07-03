import { IsEmail, ValidationArguments, IsString, IsNumber, IsNotEmpty, MaxLength, MinLength, Matches, Equals, ValidatorConstraint, ValidatorConstraintInterface, Validate } from "class-validator";

@ValidatorConstraint({ name: 'customText', async: false })
class MatchesConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must match ${args.constraints[0]}`;
  }
}
export class ResetPasswordByTokenDto {

  @IsNotEmpty({ message: " Reset token is required." })
  @IsString()
  resetToken: string;

  @IsNotEmpty({ message: "User id is required." })
  @IsNumber()
  userId: number;

  @IsNotEmpty({ message: " New Password is required." })
  @MaxLength(22, { message: "Password length cannot be greater than 15 characters." })
  @MinLength(12, { message: "Password length cannot be less than 8 characters. " })
  @Matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{12,}$/, {
    message: "Password must be at least 12 characters including 1 upper case letter, 1 lower case letter, 1 number and 1 special character.",
  })
  newPassword: string;


  @IsNotEmpty({ message: 'confirmPassword is required.' })
  @Validate(MatchesConstraint, ['newPassword'], { message: 'Passwords do not match.' })
  confirmPassword: string;

}