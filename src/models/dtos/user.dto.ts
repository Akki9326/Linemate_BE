import { IsArray, IsDefined, IsEmail, IsEnum, IsMobilePhone, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UserType } from '../enums/user-types.enum';
import { TenantVariables } from '../interfaces/variable.interface';
import { Type } from 'class-transformer';

export class UserDto {
	@IsString()
	public firstName: string;

	@IsString()
	public lastName: string;

	@IsEmail()
	public email: string;

	@IsEnum(UserType)
	public userType: UserType;

	@IsMobilePhone()
	public mobileNumber: string;

	@IsArray()
	@IsOptional()
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
	public email: string;

	@IsMobilePhone()
	public mobileNumber: string;

	@IsString()
	public employeeId: string;
}
export class UserSelectDto {
	@IsArray()
	@ValidateNested({ each: true })
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
	@IsDefined()
	public userType: UserType;

	@IsMobilePhone()
	@IsDefined()
	public mobileNumber: string;

	@IsString()
	@IsDefined()
	public countyCode: string;

	@IsString()
	@IsDefined()
	public permissionGroup: string;

	@IsString()
	@IsDefined()
	public employeeId: string;

	@IsArray()
	@IsOptional()
	public tenantVariables: TenantVariables[];

	public static fields = ['firstName', 'lastName', 'email', 'userType', 'mobileNumber', 'countyCode', 'permissionGroup', 'employeeId'];
}

export class ImportUserDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UserData)
	public data: UserData[];
}
