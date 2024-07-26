import { Request } from 'express';
import { JwtTokenData } from './jwt.user.interface';
import { AppPermission } from '../enums/app-access.enum';
import { Tenant } from './tenant.interface';
import { FileDto } from '../dtos/file.dto';

export interface TokenData {
	token: string;
	expiresIn: number;
}

export interface RequestWithUser extends Request {
	user: JwtTokenData;
	tenantId: number;
	userAccess: AppPermission[];
}
export interface UserData {
	access: AppPermission[];
	email: string;
	mobileNumber: string;
	firstName: string;
	lastName: string;
	tenantIds: Tenant[];
	countryCode: string;
	isTemporaryPassword: boolean;
}
export interface RequestWitFile extends Request {
	files: {
		file: FileDto;
	};
	user: JwtTokenData;
}
export class LoginResponseData {
	token: string;
	userData: UserData;
}
