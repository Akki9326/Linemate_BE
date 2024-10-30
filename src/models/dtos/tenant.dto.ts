import { IsArray, IsBoolean, IsEmail, IsEnum, IsMobilePhone, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ClientTypes } from '../enums/client-type.enum';

export class TenantDto {
	@IsString()
	@IsNotEmpty()
	public name: string;

	@IsEmail()
	@IsOptional()
	public email: string;

	@IsString()
	@IsOptional()
	public companyType: string;

	@IsString()
	@IsOptional()
	public trademark: string;

	@IsBoolean()
	@IsOptional()
	whatsapp: boolean;

	@IsBoolean()
	@IsOptional()
	sms: boolean;

	@IsBoolean()
	@IsOptional()
	viber: boolean;

	@IsMobilePhone()
	@IsOptional()
	public phoneNumber: number;

	@IsString()
	@IsOptional()
	public gstNumber: string;

	@IsString()
	@IsOptional()
	public currencyCode: string;

	@IsString()
	@IsOptional()
	public isdCode: string;

	@IsEnum(ClientTypes)
	@IsNotEmpty()
	public clientType: ClientTypes;

	@IsString()
	public authorisedFirstName: string;

	@IsString()
	@IsOptional()
	public authorisedLastName: string;

	@IsString()
	@IsOptional()
	public authorisedEmail: string;

	@IsMobilePhone()
	@IsOptional()
	public authorisedMobileNo: string;

	@IsString()
	@IsOptional()
	public companyAddress: string;

	@IsString()
	@IsOptional()
	public companyCountry: string;

	@IsString()
	@IsOptional()
	public companyState: string;

	@IsString()
	@IsOptional()
	public companyCity: string;

	@IsString()
	@IsOptional()
	public companyPinCode: string;

	@IsArray()
	@IsOptional()
	public whitelistedIps: string[];

	@IsString()
	@IsOptional()
	public logo: string;
}
