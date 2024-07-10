import { FRONTEND_URL, MAX_CHIEF } from '@/config';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { ListRequestDto } from '@/models/dtos/list-request.dto';
import { UserDto } from '@/models/dtos/user.dto';
import { UserType } from '@/models/enums/user-types.enum';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { AppMessages, RoleMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import { findDefaultRole } from '@/utils/helpers/default.role.helper';
import { PasswordHelper } from '@/utils/helpers/password.helper';
import { Email } from '@/utils/services/email';
import { EmailSubjects, EmailTemplates } from '@/utils/templates/email-template.transaction';
import DB from '@databases';
import { Op } from 'sequelize';
import { TenantService } from './tenant.service';
import { User } from '@/models/interfaces/users.interface';
import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'


class UserService {
  private users = DB.Users;
  private role = DB.Roles
  private tenant = DB.Tenant
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
    //  TODO: Add variable fields
    //  TODO: Send Email with password
    user = await user.save()
    this.mapUserTypeToRole(user.dataValues?.userType, user.id);
    if(userData.userType !== UserType['ChiefAdmin']){
      this.sendAccountActivationEmail(user, temporaryPassword, createdUser)
    }
    return { id: user.id };
  }
  public async one(userId: number) {
    const user = await this.users.findOne({
      where: {
        id: userId,
        isDeleted: false
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'mobileNumber', 'tenantIds', 'isTemporaryPassword', 'userType', 'countryCode']
    });
    if (!user) {
      throw new BadRequestException(AppMessages.userNotFound)
    }
    const tenantDetails = await this.findMultipleTenant(user.tenantIds);
    return { ...user.dataValues, tenantDetails };
  }
  public async update(userData: UserDto, userId: number,updatedBy:number) {
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
      throw new BadRequestException(`Email or mobile number already in use`);
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
    user.firstName = userData.firstName
    user.lastName = userData.lastName
    user.email = userData.email
    user.mobileNumber = userData.mobileNumber
    user.tenantIds = userData.tenantIds
    user.countryCode = userData.countyCode
    user.updatedBy = updatedBy.toString()
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
      throw new BadRequestException(AppMessages.userNotFound);
    }
    user.isDeleted = true;
    await user.save();
    return { id: user.id };
  }
  public async all(pageModel: ListRequestDto<{}>, user: JwtTokenData) {
    let page = pageModel.page || 1,
      limit = pageModel.pageSize || 10,
      orderByField = pageModel.sortField || 'id',
      sortDirection = pageModel.sortOrder || 'ASC';
    const offset = (page - 1) * limit;
    const condition = {}
    if (user.userType !== UserType['ChiefAdmin']) {
      condition['createdBy'] = user.id
    }
    const userList = await this.users.findAndCountAll({
      where: { isDeleted: false, ...condition },
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
  public async downloadUser(tenantId: string) {
    const tenantExists = await this.tenant.findOne({
      where: {
        id: tenantId
      }
    })

    if (!tenantExists) {
      throw new BadRequestException("Tenant Not Found")
    }

    let data = await this.users.findAll({
      where: {
        tenantIds: {
          [Op.contains]: [tenantId]
        },
        isDeleted: false
      },
      raw: true
    });
    let userData = []
    if(data.length){
     userData =  data.map((user) => {
        return {
          'First Name': user.firstName,
          'Last Name': user.lastName,
          'Email': user.email,
          'Mobile Number': user.mobileNumber,
          'User Type': user.userType,
          'Country Code': user.countryCode,
          'Created At': user.createdAt
        }
      });
    }

    let wb = XLSX.utils.book_new();

    let ws = XLSX.utils.json_to_sheet(userData);

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    let buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    let fileName = `data-${Date.now()}.xlsx`;

    if (!fs.existsSync("./public")) {
      fs.mkdirSync("./public");
    }

    const publicFolderPath = path.join('./public');

    const filePath = path.join(publicFolderPath, fileName);
    fs.writeFileSync(filePath, buffer);
    const downloadLink = `http://localhost:3000/${fileName}`;

    return downloadLink;

  }
}

export default UserService;
