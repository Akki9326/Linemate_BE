import { UserType } from '../enums/user-types.enum';

export interface User {
	id: number;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	lastLoggedInAt: Date;
	userType: UserType;
	profilePhoto?: string;
	employeeId?: string;
	mobileNumber: string;
	failedLoginAttempts: number;
	countryCode?: string;
	tenantIds: string[];
}
