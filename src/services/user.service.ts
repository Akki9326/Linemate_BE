import { FRONTEND_URL, MAX_CHIEF } from '@/config';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { UpdatePasswordDto } from '@/models/dtos/update-password.dto';
import { userListDto } from '@/models/dtos/user-list.dto';
import { UserDto } from '@/models/dtos/user.dto';
import { UserType } from '@/models/enums/user-types.enum';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { User } from '@/models/interfaces/users.interface';
import { AppMessages, CommonMessage, RoleMessage, TenantMessage, VariableMessage } from '@/utils/helpers/app-message.helper';
import { findDefaultRole } from '@/utils/helpers/default.role.helper';
import { PasswordHelper } from '@/utils/helpers/password.helper';
import { Email } from '@/utils/services/email';
import { EmailSubjects, EmailTemplates } from '@/utils/templates/email-template.transaction';
import DB from '@databases';
import { Op, Sequelize } from 'sequelize';
import { TenantService } from './tenant.service';
import VariableServices from './variable.service';


class UserService {
  private users = DB.Users;
  private role = DB.Roles
  private tenant = DB.Tenant
  private variableMaster = DB.VariableMaster
  private variableMatrix = DB.VariableMatrix
  private tenantService = new TenantService();
  private variableServices = new VariableServices();

  constructor() {
  }
  public async sendAccountActivationEmail(userData, temporaryPassword: string, createdUser: JwtTokenData) {
    await Promise.all(userData.tenantIds.map(async (tenantId) => {
      const tenantDetail = await this.tenantService.one(tenantId);
      const emailSubject = await EmailSubjects.accountActivationSubject(tenantDetail.name);
      const emailBody = EmailTemplates.accountActivationEmail(tenantDetail.name, userData.firstName, createdUser.firstName, userData.email, temporaryPassword, FRONTEND_URL);
      await Email.sendEmail(userData.email, emailSubject, emailBody);
    }));
  }
  public async addAdmin(userData: User) {
    let user = await this.users.findOne({
      where: {
        [Op.and]: [
          { isDeleted: false },
          {
            [Op.or]: [
              { email: userData.email },
              { mobileNumber: userData.mobileNumber },
            ],
          },
        ],
      },
    });
    if (user) {
      throw new BadRequestException(AppMessages.existedUser)
    }
    user = new this.users();
    user.firstName = userData.firstName
    user.lastName = userData.lastName
    user.email = userData.email
    user.mobileNumber = userData.mobileNumber
    user.isTemporaryPassword = false
    user.password = PasswordHelper.hashPassword(userData.password);
    user.userType = UserType['ChiefAdmin']
    user.countryCode = userData.countryCode
    user = await user.save()

    return user.id;
  }
  private async findMultipleTenant(tenantIds: number[]) {
    let tenantDetails = [];
    if (tenantIds && tenantIds.length > 0) {
      tenantDetails = await Promise.all(tenantIds.map(async (tenantId) => {
        return await this.tenantService.one(tenantId);
      }));
    }
    return tenantDetails

  }
  private async validateTenantVariable(tenantVariable: TenantVariables[]) {
    for (const variable of tenantVariable) {
      const tenantDetails = await this.tenant.findOne({
        where: {
          id: variable.tenantId,
          isDeleted: false
        },
        attributes: ['name']
      });
      if (!tenantDetails) {
        throw new BadRequestException(TenantMessage.tenantVariableNotFound)
      }
      const variableMaster = await this.variableMaster.findAll({ where: { isDeleted: false, tenantId: variable.tenantId } });
      if (!variableMaster.length) {
        throw new BadRequestException(`Tenant "${tenantDetails.name}" does not have any variable`);
      }
      const userVariablesMap = new Map(variable.variables.map(item => [item.variableId, item.value]));
      const mandatoryVariables = variableMaster.filter(variable => variable.isMandatory);
      const missingMandatoryVariables = mandatoryVariables.filter(mandatoryVariable => {
        const value = userVariablesMap.get(mandatoryVariable.id);
        return value === undefined || value === null || value.trim() === "";
      });
      if (missingMandatoryVariables.length > 0) {
        const missingFieldsNames = missingMandatoryVariables.map(variable => variable.name).join(', ');
        throw new BadRequestException(`Tenant "${tenantDetails.name}" Missing mandatory fields: ${missingFieldsNames}`);
      }
    }
  }
  private async addTenantVariables(tenantVariable: TenantVariables[], userId: number) {
    tenantVariable.forEach(async (tenant) => {
      tenant.variables.forEach(async (variable) => {
        const variableListMatrix = new this.variableMatrix()
        variableListMatrix.tenantId = tenant.tenantId
        variableListMatrix.userId = userId,
          variableListMatrix.variableId = variable.variableId
        variableListMatrix.value = variable.value
        variableListMatrix.createdBy = userId.toString()
        await variableListMatrix.save()
      }
      )
    })
  }
  private async updateTenantVariables(tenantVariable: TenantVariables[], userId: number) {
    for (const tenantVar of tenantVariable) {
      for (const variable of tenantVar.variables) {
        let variableListMatrix = await this.variableMatrix.findOne({
          where: {
            tenantId: tenantVar.tenantId,
            userId: userId,
            variableId: variable.variableId,
          },
        });
        if (!variableListMatrix) {
          variableListMatrix = new this.variableMatrix();
          variableListMatrix.tenantId = tenantVar.tenantId;
          variableListMatrix.userId = userId;
          variableListMatrix.variableId = variable.variableId;
        }
        variableListMatrix.value = variable.value;
        variableListMatrix.updatedBy = userId.toString()
        await variableListMatrix.save();
      }
    }
  }
  private async mapUserTypeToRole(userType: UserType, userId: number) {
    const defaultRoleIds = await findDefaultRole(userType);
    await Promise.all(defaultRoleIds.map(async (roleId: number) => {
      const role = await this.role.findOne({
        where: { id: roleId, isDeleted: false }
      });

      if (!role) {
        throw new BadRequestException(RoleMessage.roleNotFound);
      }
      const updatedUserIds = [...role.userIds, userId];
      role.userIds = updatedUserIds;
      await role.save();
    }));
  }
  public async add(userData: UserDto, createdUser: JwtTokenData) {
    let user = await this.users.findOne({
      where: {
        [Op.and]: [
          { isDeleted: false },
          {
            [Op.or]: [
              { email: userData.email },
              { mobileNumber: userData.mobileNumber },
            ],
          },
        ],
      },
    });
    if (user) {
      throw new BadRequestException(AppMessages.existedUser)
    }
    if (userData.userType === UserType['ChiefAdmin']) {
      const existingAdmin = await this.users.findAll({
        where: {
          userType: UserType['ChiefAdmin']
        }
      });
      if (existingAdmin.length > parseInt(MAX_CHIEF)) {
        throw new BadRequestException(AppMessages.maxAdmin)
      }
    } else {
      if (!userData.tenantIds || !userData.tenantIds.length) {
        throw new BadRequestException(TenantMessage.requiredTenant)
      } else {
        const tenantDetails = await this.tenant.findAll({
          where: {
            id: {
              [Op.in]: userData.tenantIds
            },
            isDeleted: false
          }
        });
        if (tenantDetails.length !== userData.tenantIds.length) {
          throw new BadRequestException(TenantMessage.tenantNotFound)
        }
      }
      if (userData.tenantVariable && userData.tenantVariable.length) {
        await this.validateTenantVariable(userData.tenantVariable)
      }else{
        throw new BadRequestException(VariableMessage.variableNotFound)
      
      }
    }
    const temporaryPassword = PasswordHelper.generateTemporaryPassword()
    user = new this.users();
    user.firstName = userData.firstName
    user.lastName = userData.lastName
    user.email = userData.email
    user.mobileNumber = userData.mobileNumber
    user.isTemporaryPassword = true
    user.createdBy = createdUser.id.toString()
    user.password = PasswordHelper.hashPassword(temporaryPassword)
    user.tenantIds = userData.userType !== UserType['ChiefAdmin'] ? userData.tenantIds : []
    user.userType = userData.userType
    user.countryCode = userData.countyCode
    user.employeeId = userData?.employeeId
    user.profilePhoto = userData?.profilePhoto
    user = await user.save()
    this.mapUserTypeToRole(user.dataValues?.userType, user.id);
    if (userData.userType !== UserType['ChiefAdmin']) {
      this.sendAccountActivationEmail(user, temporaryPassword, createdUser)
      this.addTenantVariables(userData.tenantVariable, user.id)
    }
    return { id: user.id };
  }
  public async one(userId: number,tenantId:number) {
    const user = await this.users.findOne({
      where: {
        id: userId,
        isDeleted: false
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'mobileNumber', 'tenantIds', 'isTemporaryPassword', 'userType', 'countryCode', 'employeeId', 'profilePhoto']
    });
    if (!user) {
      throw new BadRequestException(AppMessages.userNotFound)
    }
    const tenantDetails = await this.findMultipleTenant(user.tenantIds);
    let tenantVariableDetail = []
    if(tenantId){
      tenantVariableDetail = await this.findTenantVariableDetails(userId, tenantId);
    }
    return { ...user.dataValues, tenantDetails,tenantVariableDetail };
  }
  public async update(userData: UserDto, userId: number, updatedBy: number) {
    const existingUser = await this.users.findOne({
      where: {
        id: { [Op.not]: userId },
        [Op.or]: [
          { email: userData.email },
          { mobileNumber: userData.mobileNumber }
        ],
        isDeleted: false,
      },
    });

    if (existingUser) {
      throw new BadRequestException(AppMessages.existedUser);
    }
    const user = await this.users.findOne({
      where: {
        id: userId,
        isDeleted: false
      },
    });
    if (!user) {
      throw new BadRequestException(AppMessages.userNotFound)
    }
    if (!userData.tenantIds || !userData.tenantIds.length) {
      throw new BadRequestException(TenantMessage.requiredTenant)
    }
    const tenantDetails = await this.tenant.findAll({
      where: {
        id: {
          [Op.in]: userData.tenantIds
        },
        isDeleted: false
      }
    });
    if (tenantDetails.length !== userData.tenantIds.length) {
      throw new BadRequestException(TenantMessage.tenantNotFound)
    }
    if (userData.tenantVariable.length) {
      await this.validateTenantVariable(userData.tenantVariable)
    }
    user.firstName = userData.firstName
    user.lastName = userData.lastName
    user.email = userData.email
    user.mobileNumber = userData.mobileNumber
    user.tenantIds = userData.tenantIds
    user.countryCode = userData.countyCode
    user.employeeId = userData.employeeId
    user.profilePhoto = userData.profilePhoto
    user.updatedBy = updatedBy.toString()
    await user.save()
    if (userData.userType !== UserType['ChiefAdmin']) {
      this.updateTenantVariables(userData.tenantVariable, user.id)
    }
    return { id: user.id };
  }
  public async delete(userIds: number[]) {
    const usersToDelete = await this.users.findAll({
      where: {
        id: {
          [Op.in]: userIds,
        },
        isDeleted: false,
      },
    });
    if (!usersToDelete.length) {
      throw new BadRequestException(AppMessages.userNotFound);
    }
    for (const user of usersToDelete) {
      user.isDeleted = true;
      await user.save();
    }
    return usersToDelete.map(user => ({ id: user.id }));
  }
  private async findTenantVariableDetails(userId: number, tenantId: number) {
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
      const variableLabelDetails = await this.variableServices.findVariable(item.variableId, attributes)
      return {
        ...item.dataValues,
        variableLabelDetails,
      };
    }));
    return responseList
  }
  public async all(pageModel: userListDto, tenantId: number) {
    let page = pageModel.page || 1,
      limit = pageModel.pageSize || 10,
      orderByField = pageModel.sortField || 'id',
      sortDirection = pageModel.sortOrder || 'ASC';
    const offset = (page - 1) * limit;
    const condition = {
      isDeleted: false,
      isActive: true
    }
    if (pageModel.filter) {
      condition['isActive'] = pageModel.filter.isActive;
    }
    if (tenantId) {
      condition['tenantIds'] = {
        [Op.contains]: [tenantId]
      }
    }

    const userList = await this.users.findAndCountAll({
      where: condition,
      offset,
      limit,
      attributes: [
        'id',
        'firstName',
        'lastName',
        'email',
        'userType',
        'mobileNumber',
        'createdAt',
        'tenantIds',
        'employeeId',
        'profilePhoto'
      ],
      order: [[orderByField, sortDirection]],
    });
    if (userList.count) {
      const attributes = ['name']
      const userRows = await Promise.all(
        userList.rows.map(async (user) => {
          const tenantDetails = await this.findMultipleTenant(user.tenantIds);
         const tenantVariableDetails =await  this.findTenantVariableDetails(user.id, tenantId);
          return {
            ...user.dataValues,
            tenantDetails,
            tenantVariableDetails
          };
        })
      );
      userList.rows = userRows;
    }
    return userList;
  }
  public async deActive(userIds: number[]) {
    const usersToDelete = await this.users.findAll({
      where: {
        id: {
          [Op.in]: userIds,
        },
        isDeleted: false,
        isActive: true,
      },
    });
    if (!usersToDelete.length) {
      throw new BadRequestException(AppMessages.userNotFound);
    }
    for (const user of usersToDelete) {
      user.isActive = false;
      await user.save();
    }
    return usersToDelete.map(user => ({ id: user.id }));
  }
  public async changePassword(userId: number, updatePassword: UpdatePasswordDto) {
    const user = await this.users.findOne({
      where: {
        id: userId,
        isDeleted: false,
      },
    });
    if (!user) {
      throw new BadRequestException(AppMessages.userNotFound);
    }
    if (PasswordHelper.validatePassword(updatePassword.oldPassword, user.password)) {
      user.password = PasswordHelper.hashPassword(updatePassword.newPassword);
      await user.save()
    } else {
      throw new BadRequestException(AppMessages.wrongOldPassword);
    }
    await user.save();
    return { id: user.id };
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

    const responseList = this.findTenantVariableDetails(userId, tenantId);
    return responseList;
  }
}

export default UserService;
