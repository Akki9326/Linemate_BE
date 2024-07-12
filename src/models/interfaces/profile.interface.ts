import { AppPermission } from '../enums/app-access.enum';
import { UserType } from '../enums/user-types.enum';

export interface UserProfile {
	firstName: string;
	lastName: string;
	roleIds: number[];
	access: AppPermission[];
	email: string;
	mobileNumber: string;
	organisation: UserOrganisationInfo;
	userType: UserType;
}

export interface UserOrganisationInfo {
	id: number;
	name: string;
}
