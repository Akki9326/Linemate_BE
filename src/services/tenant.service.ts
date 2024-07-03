import DB from "@/databases";
import { PermissionModel } from "@/models/db/permissions.model";
import { ListRequestDto } from "@/models/dtos/list-request.dto";
import { RoleListRequestDto } from "@/models/dtos/role-list.dto";
import { TanantDto } from "@/models/dtos/tenant.dto";
import { SortOrder } from "@/models/enums/sort-order.enum";
import { Op } from "sequelize";

export class TanantService {
  private tanantModel = DB.Tenant;
  constructor() {
  }
  async add(tanantDetails: TanantDto): Promise<number> {
    const tanant = await this.tanantModel.create({
      ...tanantDetails
    });
    return tanant.id;
  }

  public async one(tenantId: number) {
    const tenantResponse = await this.tanantModel.findOne(
      {
        where: { id: tenantId, isDeleted: false },
      },
    );
    if (!tenantResponse) {
      throw new Error('Tenant not found');
    }
    return tenantResponse;
  }

  public async list(pageModel) {

    let {
      page,
      pageSize,
      searchTerm,
      sortField,
      sortOrder,
      ...whereClause
    } = pageModel;

    if (searchTerm) {
      whereClause = {
        ...whereClause,
        [Op.or]: {
          name: { [Op.iRegexp]: pageModel.searchTerm },
          trademark: { [Op.iRegexp]: pageModel.searchTerm },
          authorisedEmail: { [Op.iRegexp]: pageModel.searchTerm },
        },
      };
    }

    const { count, rows } = await this.tanantModel.findAndCountAll({
      where: {
        ...whereClause,
        isActive: true,
        isDeleted: false
      },
      // nest: true,
      distinct: true,
      order: [[pageModel.sortField || "createdAt", pageModel.sortOrder || SortOrder.ASC]],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    return {
      total: count,
      data: rows,
    };
  }
}