import { IsString, IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { NotificationsPermission } from '../interfaces/notifications-permission.enum';

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

	@IsNumber()
	@IsNotEmpty()
	public phoneNumber: number;

	@IsString()
	@IsNotEmpty()
	public gstNumber: string;

	@IsObject()
	@IsNotEmpty()
	public notificationsPermission: NotificationsPermission;

	@IsString()
	@IsNotEmpty()
	public currencyCode: string;

	@IsNumber()
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

	@IsNumber()
	public authorisedMobileNo: string;

	@IsString()
	public companyAddress: string;

	@IsString()
	public companyCountry: string;

	@IsString()
	public companyState: string;

	@IsString()
	public companyCity: string;

	@IsNumber()
	public companyPinCode: string;

	@IsString()
	public whitelistedIps: string;

	@IsString()
	public logo: string;
}
