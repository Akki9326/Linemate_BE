import DB from '@databases';
import { PermissionDto } from '@/models/dtos/permissions.dto';
import { PermissionListRequestDto } from '@/models/dtos/permissions-list.dto';

class PermissionServices {
	private permissionModel = DB.Permission;
	public async add(permission: PermissionDto, userId: number): Promise<number> {
		const permissionDetails = await this.permissionModel.create({
			name: permission.name,
			type: permission.type,
			parentId: permission.parentId,
			description: permission.description,
			createdBy: userId,
		});
		return permissionDetails.id;
	}
	public async update(permission: PermissionDto, permissionId: number, userId: number): Promise<number> {
		const [numberOfAffectedRows] = await this.permissionModel.update(
			{
				name: permission.name,
				type: permission.type,
				parentId: permission.parentId,
				description: permission.description,
				updatedBy: userId,
			},
			{
				where: { id: permissionId },
			},
		);

		if (numberOfAffectedRows === 0) {
			throw new Error('Permission not found or no changes made');
		}

		return permissionId;
	}
	public async one(permissionId: number): Promise<PermissionDto> {
		const permissionDetails = await this.permissionModel.findOne({
			where: { id: permissionId, isDeleted: false },
		});
		if (!permissionDetails) {
			throw new Error('Permission not found ');
		}
		return permissionDetails;
	}
	public async all(pageModel: PermissionListRequestDto) {
		const page = pageModel.page || 1,
			limit = pageModel.pageSize || 10,
			orderByField = pageModel.sortField || 'id',
			sortDirection = pageModel.sortOrder || 'ASC';
		const offset = (page - 1) * limit;

		return await this.permissionModel.findAndCountAll({
			where: { isDeleted: false },
			offset,
			limit,
			attributes: ['id', 'name', 'description'],
			order: [[orderByField, sortDirection]],
		});
	}
	public async remove(roleId: number, userId: number) {
		const permissionResponse = await this.permissionModel.update(
			{
				isDeleted: true,
				updatedBy: userId,
			},
			{
				where: { id: roleId },
			},
		);
		return permissionResponse;
	}
}

export default PermissionServices;
