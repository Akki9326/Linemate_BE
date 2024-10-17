import { BadRequestException } from '@/exceptions/BadRequestException';
import { VariableDto } from '@/models/dtos/variable.dto';
import { variableListDto } from '@/models/dtos/varible-list.dto';
import { VariableCategories, VariableType } from '@/models/enums/variable.enum';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { AppMessages, TenantMessage, VariableMessage } from '@/utils/helpers/app-message.helper';
import DB from '@databases';
import { VariableHelper } from '@/utils/helpers/variable.helper';
import { Op } from 'sequelize';
import { UserVariableMasterModel } from '@/models/db/userVariableMaster';
import { SortOrder } from '@/models/enums/sort-order.enum';

class VariableServices {
	private variableMaster = DB.VariableMaster;
	private tenant = DB.Tenant;
	private users = DB.Users;
	constructor() {}
	public async add(variableData: VariableDto, createdUser: JwtTokenData) {
		const tenant = await this.tenant.findOne({
			where: {
				id: variableData.tenantId,
				isDeleted: false,
			},
		});
		if (!tenant) {
			throw new BadRequestException(TenantMessage.tenantNotFound);
		}
		if (variableData.category === VariableCategories.Standard) {
			throw new BadRequestException(VariableMessage.NotAddStandard);
		}
		if (variableData.type === VariableType.MultiSelect || variableData.type === VariableType.SingleSelect) {
			if (!variableData.options || variableData.options.length === 0) {
				throw new BadRequestException(VariableMessage.possibleOptionRequired);
			}
		}
		let userVariable = new this.variableMaster();
		userVariable.name = variableData.name;
		userVariable.isMandatory = variableData.isMandatory;
		userVariable.type = variableData.type;
		userVariable.description = variableData.description;
		userVariable.category = variableData.category;
		userVariable.createdBy = createdUser.id;
		userVariable.options = variableData.options;
		userVariable.tenantId = variableData.tenantId;
		userVariable.placeHolder = variableData.placeHolder;
		userVariable = await userVariable.save();
		return { id: userVariable.id };
	}
	public async one(variableId: number) {
		const attributes = ['id', 'name', 'isMandatory', 'type', 'options', 'placeHolder'];
		const variable = await VariableHelper.findVariable(variableId, attributes);

		if (!variable) {
			throw new BadRequestException(VariableMessage.variableNotFound);
		}
		return variable;
	}
	public async update(variableData: VariableDto, variableId: number, updatedUser: JwtTokenData) {
		const tenant = await this.tenant.findOne({
			where: {
				id: variableData.tenantId,
				isDeleted: false,
			},
		});
		if (!tenant) {
			throw new BadRequestException(TenantMessage.tenantNotFound);
		}
		if (variableData.category === VariableCategories.Standard) {
			throw new BadRequestException(VariableMessage.NotEditStandard);
		}
		const variable = await this.variableMaster.findOne({
			where: {
				id: variableId,
				isDeleted: false,
			},
		});
		if (!variable) {
			throw new BadRequestException(VariableMessage.variableNotFound);
		}
		if (variableData.type === VariableType.MultiSelect || variableData.type === VariableType.SingleSelect) {
			if (!variableData.options || variableData.options.length === 0) {
				throw new BadRequestException(VariableMessage.possibleOptionRequired);
			}
		}
		variable.name = variableData.name;
		variable.isMandatory = variableData.isMandatory;
		variable.type = variableData.type;
		variable.description = variableData.description;
		variable.updatedBy = updatedUser.id;
		variable.options = variableData.options;
		variable.placeHolder = variableData.placeHolder;
		variable.tenantId = variableData.tenantId;
		await variable.save();
		return { id: variable.id };
	}
	public async delete(variableId: number, userId: number) {
		const variable = await this.variableMaster.findOne({
			where: {
				id: variableId,
				isDeleted: false,
			},
		});
		if (!variable) {
			throw new BadRequestException(VariableMessage.variableNotFound);
		}
		if (variable.category === VariableCategories.Standard) {
			throw new BadRequestException(VariableMessage.NotDeleteStandard);
		}

		variable.isDeleted = true;
		variable.updatedBy = userId;

		await variable.save();
		return { id: variable.id };
	}
	public async all(pageModel: variableListDto, tenantId: number) {
		const validSortFields = Object.keys(UserVariableMasterModel.rawAttributes).concat(['createdBy']);
		const sortField = validSortFields.includes(pageModel.sortField) ? pageModel.sortField : 'id';
		const sortOrder = Object.values(SortOrder).includes(pageModel.sortOrder as SortOrder) ? pageModel.sortOrder : SortOrder.ASC;

		const isPaginationEnabled = pageModel.page && pageModel.limit;
		if (!tenantId) {
			throw new BadRequestException(AppMessages.headerTenantId);
		}
		let condition = {};
		if (tenantId) {
			condition = {
				[Op.or]: [{ tenantId: tenantId }, { tenantId: null }],
			};
		}
		if (pageModel?.search) {
			condition = {
				...condition,
				name: { [Op.iLike]: `%${pageModel.search}%` },
			};
		}
		if (pageModel?.filter?.category) {
			condition = {
				...condition,
				category: pageModel.filter.category,
			};
		}
		const validateList = await this.variableMaster.findAndCountAll({
			where: { isDeleted: false, ...condition },
			attributes: ['id', 'name', 'isMandatory', 'type', 'description', 'category', 'options', 'tenantId'],
			order: [[sortField, sortOrder]],
			...(isPaginationEnabled && { limit: pageModel.limit, offset: (pageModel.page - 1) * pageModel.limit }), // Apply pagination if enabled
		});
		return validateList;
	}
	// without pagination variable list
	public async getVariableByTenantId(tenantId: number) {
		const validateList = await this.variableMaster.findAll({
			where: { isDeleted: false, tenantId: tenantId, [Op.or]: [{ type: VariableType.SingleSelect }, { type: VariableType.MultiSelect }] },
			attributes: ['id', 'name', 'options'],
		});
		return validateList;
	}
}

export default VariableServices;
