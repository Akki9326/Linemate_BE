import DB from "@/databases";
import { BadRequestException } from "@/exceptions/BadRequestException";
import { UserModel } from "@/models/db/users.model";

import { RoleDto, RoleListRequestDto } from "@/models/dtos/role.dto";
import { UserType } from "@/models/enums/user-types.enum";
import { JwtTokenData } from "@/models/interfaces/jwt.user.interface";
import { RoleMessage, TenantMessage } from "@/utils/helpers/app-message.helper";
import { Op } from "sequelize";

export class RoleService {
  private role = DB.Roles;
  private permissionModel = DB.Permission;

  constructor() { }

  async add(roleDetails: RoleDto, user: JwtTokenData): Promise<number> {
    if(user.userType === UserType.CompanyAdmin){
      if(!roleDetails.tenantId){
        throw new BadRequestException(TenantMessage.requiredTenant);
      }
    }
    const role = new this.role({
      name: roleDetails.name,
      type: roleDetails.type,
      description: roleDetails.description,
      permissionsIds: roleDetails.permissionIds,
      userIds: roleDetails.userIds,
      tenantId: roleDetails.tenantId,
      createdBy: user.id.toString()
    });
    await role.save();
    return role.id;
  }

  public async update(roleDetails: RoleDto, roleId: number, user: JwtTokenData): Promise<number> {
    const role = await this.role.findOne({
      where: { isDeleted: false, id: roleId }
    });

    if (!role) {
      throw new BadRequestException(RoleMessage.roleNotFound);
    }
    role.set({
      name: roleDetails.name,
      type: roleDetails.type,
      description: roleDetails.description,
      permissionsIds: roleDetails.permissionIds,
      userIds: roleDetails.userIds,
      tenantId: roleDetails.tenantId,
      updatedBy: user.id.toString()
    });

    await role.save();
    return role.id;
  }

  async fetchPermissionDetails(permissionId: number) {
    const permission = await this.permissionModel.findByPk(permissionId, {
    });
    return permission.name;
  }

  public async one(roleId: number) {
    const rolesResult = await this.role.findOne({
      where: { id: roleId, isDeleted: false }
    });

    if (!rolesResult) {
      throw new BadRequestException(RoleMessage.roleNotFound);
    }
    
    const rolesWithPermission = await Promise.all(rolesResult.dataValues.permissionsIds.map(async (permissionId: number) => {
      const permissionData = await this.fetchPermissionDetails(permissionId);
      return permissionData;
    }));

    return {
      name: rolesResult.dataValues.name,
      description: rolesResult.description,
      permission: rolesWithPermission,
      userIds:rolesResult.userIds,
      type:rolesResult.type,
    };
  }

  async fetchUserDetails(userId: number) {
    const user = await UserModel.findByPk(userId, {
      attributes: ['id', 'firstName', "lastName"],
    });
    return user;
  }

  public async all(pageModel: RoleListRequestDto) {
    const { page = 1, pageSize = 10, sortField = 'id', sortOrder = 'ASC' } = pageModel;
    const offset = (page - 1) * pageSize;
    const rolesResult = await this.role.findAndCountAll({
      where: { isDeleted: false },
      offset,
      limit: pageSize,
      order: [[sortField, sortOrder]],
      attributes: ['id', 'name', 'description', 'createdAt', 'createdBy'],
    });
    const rolesWithCreator = await Promise.all(rolesResult.rows.map(async (role) => {
      const creator = await this.fetchUserDetails(parseInt(role.createdBy));
      return { ...role.toJSON(), creator };
    }));

    return {
      count: rolesResult.count,
      rows: rolesWithCreator,
    };
  }

  public async remove(roleId: number) {
    const role = await this.role.findOne({
      where: { isDeleted: false, id: roleId }
    });

    if (!role) {
      throw new BadRequestException(RoleMessage.roleNotFound);
    }

    role.set({
      isDeleted: true
    });

    await role.save();
    return role.id;
  }

  public async getAccessByRoleIds(userId: number): Promise<string[]> {
    const roleResponse = await this.role.findOne({
      where: {
        userIds: { [Op.contains]: [userId] },
      },
    });

    const permissionsIds = roleResponse?.dataValues?.permissionsIds || [];
    if (permissionsIds.length > 0) {
      const permissions = await this.permissionModel.findAll({
        where: { id: { [Op.in]: permissionsIds } },
        attributes: ['name'],
      });
      const permissionNames = permissions.map(permission => permission.name);
      return permissionNames
    }
    return [];
  }
}