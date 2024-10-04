import { IsArray, IsDefined, IsEmail, IsEnum, IsMobilePhone, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UserType } from '../enums/user-types.enum';
import { TenantVariables } from '../interfaces/variable.interface';
import { Transform, Type } from 'class-transformer';

export class UserDto {
	@IsString()
	public firstName: string;

	@IsString()
	public lastName: string;

	@IsEmail()
	public email: string;

	@IsEnum(UserType)
	@IsOptional()
	public userType: UserType = UserType.User;

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
	public tenantVariables: TenantVariables[];

	public static fields = ['firstName', 'lastName', 'email', 'userType', 'mobileNumber', 'countyCode', 'permissionGroup', 'employeeId'];
}

export class ImportUserDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UserData)
	public data: UserData[];
}
