import { Transform, Type } from 'class-transformer';
import {
	IsArray,
	IsDateString,
	IsDefined,
	IsEmail,
	IsEnum,
	IsISO8601,
	IsMobilePhone,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { UserType } from '../enums/user-types.enum';
import { TenantVariables, variableValues } from '../interfaces/variable.interface';

export class UserDto {
	@IsString()
	public firstName: string;

	@IsString()
	@IsOptional()
	public lastName: string;

	@IsEmail()
	@IsOptional()
	public email: string;

	@IsEnum(UserType)
	public userType: UserType = UserType.User;

	@IsMobilePhone()
	@IsNotEmpty()
	public mobileNumber: string;

	@IsArray()
	public tenantIds: number[];

	@IsString()
	@IsOptional()
	public countyCode: string;

	@IsString()
	@IsOptional()
	public employeeId: string;

	@IsString()
	@IsOptional()
	public profilePhoto: string;

	@IsArray()
	@IsOptional()
	public tenantVariables: TenantVariables[];

	@IsNumber()
	@IsOptional()
	public reportToId: number;

	@IsString()
	@IsOptional()
	public role: string;

	@IsOptional()
	@IsISO8601()
	public joiningDate: Date;
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

export class UserActionDto {
	@IsArray()
	public userIds: number[];
}
export class SelectUserData {
	@IsEmail()
	@IsOptional()
	public email: string;

	@IsMobilePhone()
	@IsOptional()
	public mobileNumber: string;

	@IsString()
	@IsOptional()
	public employeeId: string;
}
export class UserSelectDto {
	@IsArray()
	@Type(() => SelectUserData)
	public data: SelectUserData[];
}

export class UserVariableDto {
	@IsNumber()
	public tenantId: number;
}

export class ChangePasswordDto {
	@IsArray()
	public userIds: number[];

	@IsNumber()
	public tenantId: number;
}

export class UserData {
	@IsString()
	@IsDefined()
	public firstName: string;

	@IsString()
	@IsDefined()
	public lastName: string;

	@IsEmail()
	@IsDefined()
	public email: string;

	@IsEnum(UserType)
	@IsOptional()
	@Transform(({ value }) => {
		return value === '' || value === undefined ? UserType.User : value;
	})
	public userType: UserType;

	@IsMobilePhone()
	@IsDefined()
	public mobileNumber: string;

	@IsString()
	@IsDefined()
	@IsOptional()
	public countyCode: string;

	@IsString()
	@IsDefined()
	@IsOptional()
	public permissionGroup: string;

	@IsString()
	@IsDefined()
	public employeeId: string;

	@IsArray()
	@IsOptional()
	public tenantVariables: variableValues[];

	@IsEmail()
	@IsOptional()
	public reportTo: string;

	@IsString()
	@IsOptional()
	public role: string;

	@IsOptional()
	@IsDateString()
	public joiningDate: Date;

	public static fields = [
		'firstName',
		'lastName',
		'email',
		'userType',
		'mobileNumber',
		'countyCode',
		'permissionGroup',
		'employeeId',
		'reportToId',
		'role',
		'joiningDate',
	];
}

export class ImportUserDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UserData)
	public data: UserData[];
}
