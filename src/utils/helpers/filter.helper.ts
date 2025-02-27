import DB from '@/databases';
import { Op } from 'sequelize';

export const FilterHelper = {
	formatOptions: (options: string[]) => {
		return options.map(option => ({
			id: option,
			name: option,
		}));
	},
	createdByOption: async (tenantId: number) => {
		const userList = await DB.Users.findAll({
			where: {
				tenantIds: {
					[Op.contains]: [tenantId],
				},
				isDeleted: false,
			},
			attributes: ['id', 'firstName', 'lastName'],
		});
		return userList.map(user => ({
			id: user.id,
			name: `${user.firstName} ${user.lastName}`,
		}));
	},

	assignedCompaniesOption: async () => {
		const tenantList = await DB.Tenant.findAll({
			where: {
				isDeleted: false,
			},
			attributes: ['id', 'name'],
		});
		return tenantList.map(tenant => ({
			id: tenant.id,
			name: `${tenant.name}`,
		}));
	},
};
