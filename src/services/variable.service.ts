import { BadRequestException } from '@/exceptions/BadRequestException';
import { VariableDto } from '@/models/dtos/variable.dto';
import { variableListDto } from '@/models/dtos/varible-list.dto';
import { VariableType } from '@/models/enums/variable.enum';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { AppMessages, TenantMessage, VariableMessage } from '@/utils/helpers/app-message.helper';
import DB from '@databases';


class VariableServices {
  private variableMaster = DB.VariableMaster;
  private variableMatrix = DB.VariableMatrix;
  private users = DB.Users;
  private tenant = DB.Tenant;

  constructor() {
  }
  public async add(variableData: VariableDto, createdUser: JwtTokenData) {
    const tenant = await this.tenant.findOne({
      where: {
        id: variableData.tenantId,
        isDeleted: false
      },
    });
    if (!tenant) {
      throw new BadRequestException(TenantMessage.requiredTenant)
    }
    if (variableData.type === VariableType.multiSelect || variableData.type === VariableType.singleSelect) {
      if (!variableData.options || variableData.options.length === 0) {
        throw new BadRequestException(VariableMessage.possibleOptionRequired)
      }
    }
    let userVariable = new this.variableMaster()
    userVariable.name = variableData.name
    userVariable.isMandatory = variableData.isMandatory
    userVariable.type = variableData.type
    userVariable.description = variableData.description
    userVariable.category = variableData.category
    userVariable.createdBy = createdUser.id.toString()
    userVariable.options = variableData.options
    userVariable.tenantId = variableData.tenantId
    userVariable.placeHolder = variableData.placeHolder
    userVariable = await userVariable.save()
    return { id: userVariable.id };
  }
  private async findVariable(variableId: number, attributes: any[]) {
    return await this.variableMaster.findOne({ where: { id: variableId, isDeleted: false }, attributes: attributes })
  }
  public async one(variableId: number) {
    const attributes = ['id', 'name', 'isMandatory', 'type', 'options', "placeHolder"]
    const variable = await this.findVariable(variableId, attributes)

    if (!variable) {
      throw new BadRequestException(VariableMessage.variableNotFound)
    }
    return variable;
  }
  public async getVariableDetails(userId: number, tenantId: number) {
    const user = await this.users.findOne({
      where: {
        id: userId,
        isDeleted: false
      },
    });
    if (!user) {
      throw new BadRequestException(AppMessages.userNotFound)
    }
    let allVariable = await this.variableMatrix.findAll({
      where: {
        userId,
        tenantId,
        isDeleted: false
      },
      attributes: ['id', 'variableId', 'value']
    });
    if (!allVariable.length) {
      throw new BadRequestException(VariableMessage.variableNotFound)
    }
    const attributes = ['name']
    const responseList = await Promise.all(allVariable.map(async (item) => {
      const variableDetails = await this.findVariable(item.id, attributes)
      console.log('variableDetails', variableDetails)
      return {
        ...item.dataValues,
        variableDetails,
      };
    }));
    console.log('responseList', responseList)
    return responseList;
  }
  public async update(variableData: VariableDto, variableId: number, updatedUser: JwtTokenData) {
    const variable = await this.variableMaster.findOne({
      where: {
        id: variableId,
        isDeleted: false,
      },
    });
    if (!variable) {
      throw new BadRequestException(VariableMessage.variableNotFound);
    }
    if (variableData.type === VariableType.multiSelect || variableData.type === VariableType.singleSelect) {
      if (!variableData.options || variableData.options.length === 0) {
        throw new BadRequestException(VariableMessage.possibleOptionRequired)
      }
    }
    variable.name = variableData.name
    variable.isMandatory = variableData.isMandatory
    variable.type = variableData.type
    variable.description = variableData.description
    variable.category = variableData.category
    variable.updatedBy = updatedUser.id.toString()
    variable.options = variableData.options
    variable.placeHolder = variableData.placeHolder
    variable.tenantId = variableData.tenantId
    await variable.save()
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
  public async all(pageModel: variableListDto) {
    let page = pageModel.page || 1,
      limit = pageModel.pageSize || 10,
      orderByField = pageModel.sortField || 'id',
      sortDirection = pageModel.sortOrder || 'ASC';
    const offset = (page - 1) * limit;
    const condition = {}
    if (pageModel.filter.tenantId) {
      condition['tenantId'] = pageModel.filter.tenantId;
    }
    const validateList = await this.variableMaster.findAndCountAll({
      where: { isDeleted: false, ...condition },
      offset,
      limit,
      attributes: [
        'id',
        'name',
        'isMandatory',
        'type',
        'description',
        'category',
        'options',
      ],
      order: [[orderByField, sortDirection]],
    });
    return validateList;
  }
}

export default VariableServices;
