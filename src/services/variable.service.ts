import { BadRequestException } from '@/exceptions/BadRequestException';
import { VariableDto } from '@/models/dtos/variable.dto';
import { variableListDto } from '@/models/dtos/varible-list.dto';
import { VariableType } from '@/models/enums/variable.enum';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { AppMessages, TenantMessage, VariableMessage } from '@/utils/helpers/app-message.helper';
import DB from '@databases';
import { VariableHelper } from '@/utils/helpers/variable.helper';
import { Op } from 'sequelize';

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
		userVariable.createdBy = createdUser.id.toString();
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
		variable.category = variableData.category;
		variable.updatedBy = updatedUser.id.toString();
		variable.options = variableData.options;
		variable.placeHolder = variableData.placeHolder;
		variable.tenantId = variableData.tenantId;
		await variable.save();
		return { id: variable.id };
	}
	public async delete(variableId: number) {
		const variable = await this.variableMaster.findOne({
			where: {
				id: variableId,
				isDeleted: false,
			},
		});
		if (!variable) {
			throw new BadRequestException(VariableMessage.variableNotFound);
		}
		variable.isDeleted = true;
		await variable.save();
		return { id: variable.id };
	}
	public async all(pageModel: variableListDto, tenantId: number) {
		const page = pageModel.page || 1,
			limit = pageModel.pageSize || 10,
			orderByField = pageModel.sortField || 'id',
			sortDirection = pageModel.sortOrder || 'ASC';
		const offset = (page - 1) * limit;
		let condition = {};
		if (tenantId) {
			condition['tenantId'] = tenantId;
		}
		if (pageModel?.search) {
			condition = {
				...condition,
				name: { [Op.iRegexp]: pageModel.search },
			};
		}
		const validateList = await this.variableMaster.findAndCountAll({
			where: { isDeleted: false, ...condition },
			offset,
			limit,
			attributes: ['id', 'name', 'isMandatory', 'type', 'description', 'category', 'options', 'tenantId'],
			order: [[orderByField, sortDirection]],
		});
		return validateList;
	}
	public async getVariableDetails(userId: number, tenantId: number) {
		const user = await this.users.findOne({
			where: {
				id: userId,
				isDeleted: false,
			},
		});
		if (!user) {
			throw new BadRequestException(AppMessages.userNotFound);
		}

		const responseList = VariableHelper.findTenantVariableDetails(userId, tenantId);
		return responseList;
	}
}

export default VariableServices;
