import DB from '@/databases';
import { RoleType } from '@/models/enums/role.enum';
import { getPermissionGroup, UserType } from '@/models/enums/user-types.enum';

export const findDefaultRole = (userType: UserType) => {
	return getPermissionGroup(userType);
};
export const insertDefaultRoles = async (tenantId: number, createdBy: number) => {
	const rolesToInsert = Object.values(UserType)
		.map(roleName => ({
			name: getPermissionGroup(roleName),
			description: '',
			type: RoleType.Standard,
			permissionsIds: [],
			userIds: [],
			tenantId,
			createdBy,
		}))
		.filter(role => role.name);
	const response = await DB.Roles.bulkCreate(rolesToInsert);
	return response;
};
