import { FRONTEND_URL, MAX_CHIEF } from '@/config';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { UpdatePasswordDto } from '@/models/dtos/update-password.dto';
import { userListDto } from '@/models/dtos/user-list.dto';
import { UserDto } from '@/models/dtos/user.dto';
import { UserType } from '@/models/enums/user-types.enum';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { User } from '@/models/interfaces/users.interface';
import { AppMessages, CommonMessage, RoleMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import { findDefaultRole } from '@/utils/helpers/default.role.helper';
import { PasswordHelper } from '@/utils/helpers/password.helper';
import { Email } from '@/utils/services/email';
import { EmailSubjects, EmailTemplates } from '@/utils/templates/email-template.transaction';
import DB from '@databases';
import { Op, Sequelize } from 'sequelize';
import { TenantService } from './tenant.service';


class UserService {
  private users = DB.Users;
  private role = DB.Roles
  private tenant = DB.Tenant
  private variableMaster = DB.VariableMaster
  private variableMatrix = DB.VariableMatrix
  private tenantService = new TenantService();

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
      const variableMaster = await this.variableMaster.findAll({ where: { isDeleted: false, tenantId: variable.tenantId } });
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
    tenantVariable.forEach(async (tenantVariable) => {
      const variableListMatrix = new this.variableMatrix()
      tenantVariable.variables.forEach(async (variable) => {
        variableListMatrix.tenantId = tenantVariable.tenantId
        variableListMatrix.userId = userId,
          variableListMatrix.variableId = variable.variableId
        variableListMatrix.value = variable.value
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
      }
    }
    if (userData.userType === UserType['User']) {
      if (userData.tenantVariable.length) {
        await this.validateTenantVariable(userData.tenantVariable)
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
    }
    if (userData.userType === UserType['User']) {
      this.addTenantVariables(userData.tenantVariable, user.id)
    }
    return { id: user.id };
  }
  public async one(userId: number) {
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
    return { ...user.dataValues, tenantDetails };
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
    if (!user.tenantIds || !user.tenantIds.length) {
      throw new BadRequestException(TenantMessage.requiredTenant)
    }
    if (userData.userType === UserType['User']) {
      if (userData.tenantVariable.length) {
        await this.validateTenantVariable(userData.tenantVariable)
      }
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
    if (userData.userType === UserType['User']) {
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
    if (!usersToDelete) {
      throw new BadRequestException(AppMessages.userNotFound);
    }
    for (const user of usersToDelete) {
      user.isDeleted = true;
      await user.save();
    }
    return usersToDelete.map(user => ({ id: user.id }));
  }
  public async all(pageModel: userListDto, user: JwtTokenData) {
    let page = pageModel.page || 1,
      limit = pageModel.pageSize || 10,
      orderByField = pageModel.sortField || 'id',
      sortDirection = pageModel.sortOrder || 'ASC';
    const offset = (page - 1) * limit;
    const condition = {
      isDeleted: false,
      isActive: true
    }
    if (user.userType !== UserType['ChiefAdmin']) {
      if (pageModel.filter) {
        condition['isActive'] = pageModel.filter.isActive;
        if (pageModel.filter.tenantId) {
          condition['tenantIds'] = {
            [Op.contains]: Sequelize.cast(Sequelize.literal(`ARRAY[${pageModel.filter.tenantId}]`), 'INTEGER[]')
          };
        } else {
          throw new BadRequestException(TenantMessage.requiredTenantFilter)
        }
      } else {
        throw new BadRequestException(CommonMessage.filterIsRequired)
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
      const userRows = await Promise.all(
        userList.rows.map(async (user) => {
          const tenantDetails = await this.findMultipleTenant(user.tenantIds);
          return {
            ...user.dataValues,
            tenantDetails,
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
      },
    });
    if (!usersToDelete) {
      throw new BadRequestException(AppMessages.userNotFound);
    }
    for (const user of usersToDelete) {
      user.isActive = true;
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
}

export default UserService;
