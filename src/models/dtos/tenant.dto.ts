import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class TenantDto {
	@IsString()
	@IsNotEmpty()
	public name: string;

	@IsString()
	@IsNotEmpty()
	public companyType: string;

	@IsString()
	@IsNotEmpty()
	public trademark: string;

	@IsBoolean()
	whatsapp: boolean;

	@IsBoolean()
	sms: boolean;

	@IsBoolean()
	viber: boolean;

	@IsString()
	@IsNotEmpty()
	public phoneNumber: number;

	@IsString()
	@IsNotEmpty()
	public gstNumber: string;

	@IsString()
	@IsNotEmpty()
	public currencyCode: string;

	@IsString()
	@IsNotEmpty()
	public isdCode: string;

	@IsString()
	@IsNotEmpty()
	public clientType: string;

	@IsString()
	public authorisedFirstName: string;

	@IsString()
	public authorisedLastName: string;

	@IsString()
	public authorisedEmail: string;

	@IsString()
	public authorisedMobileNo: string;

	@IsString()
	public companyAddress: string;

	@IsString()
	public companyCountry: string;

	@IsString()
	public companyState: string;

	@IsString()
	public companyCity: string;

	@IsString()
	public companyPinCode: string;

	@IsString()
	public whitelistedIps: string;

	@IsString()
	public logo: string;
}
