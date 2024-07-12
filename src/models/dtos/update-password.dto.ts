import { IsNotEmpty, Matches, MinLength, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

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

export class UpdatePasswordDto {
	@IsNotEmpty({ message: 'Old password is required.' })
	oldPassword: string;

	@IsNotEmpty({ message: 'New password is required.' })
	@MinLength(8, { message: 'Password length cannot be less than 8 characters. ' })
	@Matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
		message: 'Password must be at least 8 characters including 1 upper case letter, 1 lower case letter, 1 number and 1 special character.',
	})
	newPassword: string;

	@IsNotEmpty({ message: 'Confirm password is required.' })
	@Validate(MatchesConstraint, ['newPassword'], { message: 'Passwords do not match.' })
	confirmPassword: string;
}
