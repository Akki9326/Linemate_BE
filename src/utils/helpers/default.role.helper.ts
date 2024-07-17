import DB from '@/databases';
import { RoleType } from '@/models/enums/role.enum';
import { UserType } from '@/models/enums/user-types.enum';

const userTypeDefaultRoles = {
	'Company Admin': 'company_admin_role',
	'Support User': 'support_user_role',
	User: 'user_role',
};

export const findDefaultRole = (userType: UserType) => {
	return userTypeDefaultRoles[userType];
};
export const insertDefaultRoles = async (tenantId: number, createdBy: number) => {
	const rolesToInsert = Object.values(userTypeDefaultRoles).map(roleName => ({
		name: roleName,
		description: '',
		type: RoleType.Standard,
		permissionsIds: [],
		userIds: [],
		tenantId,
		createdBy: createdBy,
	}));
	const response = await DB.Roles.bulkCreate(rolesToInsert);
	return response;
};
