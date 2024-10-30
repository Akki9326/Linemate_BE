export enum UserType {
	ChiefAdmin = 'Chief Admin',
	CompanyAdmin = 'Company Admin',
	SupportUser = 'Support User',
	User = 'User',
}

export enum UserStatus {
	Active = 'active',
	InActive = 'in-active',
}

export const getPermissionGroup = (userType: UserType): string => {
	switch (userType) {
		case UserType.CompanyAdmin:
			return 'company_admin_role';
		case UserType.SupportUser:
			return 'support_user_role';
		case UserType.User:
			return 'user_role';
	}
};
