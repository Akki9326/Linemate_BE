import { MAX_CHIEF } from '@/config';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { ListRequestDto } from '@/models/dtos/list-request.dto';
import { UserDto } from '@/models/dtos/user.dto';
import { UserType } from '@/models/enums/user-types.enum';
import { User } from '@/models/interfaces/users.interface';
import { findDefaultRole } from '@/utils/helpers/default.role.helper';
import { PasswordHelper } from '@/utils/helpers/password.helper';
import DB from '@databases';
import { Op } from 'sequelize';
import { TenantService } from './tenant.service';


class UserService {
  private users = DB.Users;
  private role = DB.Roles
  private tenantService = new TenantService();

  constructor() {
  }
  public async addAdmin(userData: any) {
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
      throw new BadRequestException(`User already exists`)
    }
    user = new this.users();
    user.firstName = userData.firstName
    user.lastName = userData.lastName
    user.email = userData.email
    user.mobileNumber = userData.mobileNumber
    user.isTemporaryPassword = false
    user.password = PasswordHelper.hashPassword(userData.password);
    user.userType = UserType['Chief admin']
    console.log('userData', userData)
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
  private async mapUserTypeToRole(userType: UserType, userId: number) {
    const defaultRoleIds = await findDefaultRole(userType);
    await Promise.all(defaultRoleIds.map(async (roleId: number) => {
      const role = await this.role.findOne({
        where: { id: roleId, isDeleted: false }
      });

      if (!role) {
        throw new BadRequestException(`Role not found`);
      }
      const updatedUserIds = [...role.userIds, userId];
      role.userIds = updatedUserIds;
      await role.save();
    }));
  }
  public async add(userData: UserDto, userId: number) {
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
      throw new BadRequestException(`User already exists`)
    }
    if (userData.userType === UserType['Chief admin']) {
      const existingAdmin = await this.users.findAll({
        where: {
          userType: UserType['Chief admin']
        }
      });
      if(existingAdmin.length > parseInt(MAX_CHIEF)) {
        throw new BadRequestException(`more than 5 chief admin not allowed`)
      }
    }
    const temporaryPassword = PasswordHelper.generateTemporaryPassword()
    user = new this.users();
    user.firstName = userData.firstName
    user.lastName = userData.lastName
    user.email = userData.email
    user.mobileNumber = userData.mobileNumber
    user.isTemporaryPassword = true
    user.createdBy = userId.toString()
    user.password = PasswordHelper.hashPassword(temporaryPassword)
    user.tenantIds = userData.userType !== UserType['Chief admin'] ?   userData.tenantIds :[]
    user.userType = userData.userType
    //  TODO: Add variable fields
    //  TODO: Send Email with password
    console.log('user', user)
    user = await user.save()
    this.mapUserTypeToRole(user.dataValues?.userType, user.id);
    return { id: user.id };
  }
  public async one(userId: number) {
    const user = await this.users.findOne({
      where: {
        id: userId,
        isDeleted: false
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'mobileNumber', 'tenantIds', 'isTemporaryPassword','userType']
    });
    const tenantDetails = await this.findMultipleTenant(user.tenantIds);
    if (!user) {
      throw new BadRequestException(`User not found`)
    }
    return { ...user.dataValues, tenantDetails };
  }
  public async update(userData: UserDto, userId: number) {
    const user = await this.users.findOne({
      where: {
        id: userId,
        isDeleted: false
      },
    });
    if (!user) {
      throw new BadRequestException(`User not found`)
    }
    user.firstName = userData.firstName
    user.lastName = userData.lastName
    user.email = userData.email
    user.mobileNumber = userData.mobileNumber
    user.tenantIds = userData.tenantIds
    await user.save()
    return { id: user.id };
  }
  public async delete(userId: number) {
    const user = await this.users.findOne({
      where: {
        id: userId,
        isDeleted: false,
      },
    });
    if (!user) {
      throw new BadRequestException(`User not found`);
    }
    user.isDeleted = true;
    await user.save();
    return { id: user.id };
  }
  public async all(pageModel: ListRequestDto<{}>, user: User) {
    let page = pageModel.page || 1,
      limit = pageModel.pageSize || 10,
      orderByField = pageModel.sortField || 'id',
      sortDirection = pageModel.sortOrder || 'ASC';
    const offset = (page - 1) * limit;
    const condition = {}
    if(user.userType !== UserType['Chief admin']){
      condition['createdBy'] = user.id
    }
    const userList = await this.users.findAndCountAll({
      where: { isDeleted: false,...condition  },
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
}

export default UserService;
