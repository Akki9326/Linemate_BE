import DB from "@/databases";
import { PermissionModel } from "@/models/db/permissions.model";
import { RoleListRequestDto } from "@/models/dtos/role-list.dto";
import { RoleDto } from "@/models/dtos/role.dto";
import { Op } from "sequelize";

export class RoleService {
  private roleModel = DB.Roles;
  constructor() {
  }
  async add(roleDetails: RoleDto): Promise<number> {
    const role = await this.roleModel.create({
      name: roleDetails.name,
      type: roleDetails.type,
      description: roleDetails.description,
      permissionsIds: roleDetails.permissionId,
      userIds: roleDetails.userId,
      tenantId: roleDetails.tenantId
    });
    return role.id;
  }
  public async update(roleDetails: RoleDto, roleId: number): Promise<number> {
    const [numberOfAffectedRows] = await this.roleModel.update(
      {
        name: roleDetails.name,
        type: roleDetails.type,
        description: roleDetails.description,
        permissionsIds: roleDetails.permissionId,
        userIds: roleDetails.userId,
        tenantId: roleDetails.tenantId
      },
      {
        where: { id: roleId },
      },
    );

    if (numberOfAffectedRows === 0) {
      throw new Error('Role not found or no changes made');
    }

    return roleId;
  }
  public async one(roleId: number) {
    const roleResponse = await this.roleModel.findOne(
      {
        where: { id: roleId, isDeleted: false },
      },
    );
    if (!roleResponse) {
      throw new Error('Role not found');
    }
    return roleResponse;
  }
  public async all(pageModel: RoleListRequestDto) {
    let page = pageModel.page || 1,
      limit = pageModel.pageSize || 10,
      orderByField = pageModel.sortField || 'id',
      sortDirection = pageModel.sortOrder || 'ASC';
    const offset = (page - 1) * limit;

    return await this.roleModel.findAndCountAll({
      where: { isDeleted: false },
      offset,
      limit,
      order: [[orderByField, sortDirection]]
    });
  }
  public async remove(roleId: number) {
    const roleResponse = await this.roleModel.update(
      {
        isDeleted: true
      },
      {
        where: { id: roleId },
      },
    );
    return roleResponse;
  }
  public async getAccessByRoleIds(userId: number) {
    const roleResponse = await this.roleModel.findOne({
      where: {
        userIds: {
          [Op.contains]: [userId],
        },
      },
    });
    const { permissionsIds } = roleResponse.dataValues;

    if (permissionsIds && permissionsIds.length > 0) {
      const permissions = await PermissionModel.findAll({
        where: {
          id: {
            [Op.in]: permissionsIds,
          },
        },
        attributes: ['name'],
      });
       const permissionNames = permissions.map(permission => permission.name);
       console.log('permissionNames :>> ', permissionNames);
      return permissionNames
    }
  }

}