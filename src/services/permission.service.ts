import { BadRequestException } from '@/exceptions/BadRequestException';
import { PermissionModel } from '@/models/db/permissions.model';
import { PermissionListRequestDto } from '@/models/dtos/permissions-list.dto';
import { PermissionDto } from '@/models/dtos/permissions.dto';
import { PermissionType } from '@/models/enums/permissions.enum';
import { PermissionMessage } from '@/utils/helpers/app-message.helper';
import DB from '@databases';
import { BelongsTo, Op } from 'sequelize';

class PermissionServices {
	private permissionModel = DB.Permission;
	public async add(permission: PermissionDto, userId: number): Promise<number> {
		const existingPermission = await this.permissionModel.findOne({ where: { name: permission.name, isDeleted: false } });
		if (existingPermission) {
			throw new BadRequestException(PermissionMessage.permissionAlready);
		}
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
		const findPermission = await this.permissionModel.findOne({ where: { id: permissionId, isDeleted: false } });
		if (!findPermission) {
			throw new BadRequestException(PermissionMessage.permissionNotFound);
		}
		const existingPermission = await this.permissionModel.findOne({
			where: {
				name: permission.name,
				id: {
					[Op.ne]: permissionId,
				},
				isDeleted: false,
			},
		});
		if (existingPermission) {
			throw new BadRequestException(PermissionMessage.permissionAlready);
		}
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
			throw new BadRequestException('Permission not found or no changes made');
		}

		return permissionId;
	}
	public async one(permissionId: number): Promise<PermissionDto> {
		const permissionDetails = await this.permissionModel.findOne({
			where: { id: permissionId, isDeleted: false },
			attributes: ['id', 'name', 'type', 'description'],
			include: [
				{
					association: new BelongsTo(PermissionModel, PermissionModel, { as: 'parent', foreignKey: 'parentId' }),
					attributes: ['id', 'name', 'type', 'description'],
				},
			],
		});
		if (!permissionDetails) {
			throw new BadRequestException('Permission not found ');
		}
		return permissionDetails;
	}
	public async all(pageModel: PermissionListRequestDto) {
		const page = pageModel.page || 1;
		const limit = pageModel.limit || 10;
		const orderByField = pageModel.sortField || 'id';
		const sortDirection = pageModel.sortOrder || 'ASC';
		const offset = (page - 1) * limit;

		// Fetch all top-level permissions (parentId = null)
		return await this.permissionModel.findAndCountAll({
			where: {
				isDeleted: false,
				parentId: null,
				type: PermissionType.Tenant,
			},
			offset,
			limit,
			attributes: ['id', 'name', 'description'],
			include: [
				{
					model: this.permissionModel,
					as: 'children', // Alias for child permissions
					attributes: ['id', 'name', 'description'],
					where: { isDeleted: false },
					required: false,
					include: [
						{
							model: this.permissionModel,
							as: 'children', // Nested children of Channel Dashboard
							attributes: ['id', 'name', 'description'],
							where: { isDeleted: false },
							required: false,
						},
					],
				},
			],
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
