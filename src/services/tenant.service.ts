import DB from "@/databases";
import { BadRequestException } from "@/exceptions/BadRequestException";
import { NotFoundException } from "@/exceptions/NotFoundException";
import { TenantDto } from "@/models/dtos/tenant.dto";
import { SortOrder } from "@/models/enums/sort-order.enum";
import { Op } from "sequelize";

export class TenantService {
  private tenantModel = DB.Tenant;
  constructor() {
  }
  async add(tenantDetails: TenantDto): Promise<number> {
    const gstNumber = tenantDetails.gstNumber

    const regex = new RegExp("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")

    if (regex.test(gstNumber) == false) {
      throw new BadRequestException("Invalid Gst Number")
    }

    const tenant = await this.tenantModel.create({
      ...tenantDetails
    });
    return tenant.id;
  }

  public async one(tenantId: number) {
    const tenantResponse = await this.tenantModel.findOne(
      {
        where: { id: tenantId, isDeleted: false },
      },
    );
    if (!tenantResponse) {
      throw new NotFoundException('Tenant not found');
    }
    return tenantResponse;
  }
  public async delete(tenantId: number) {
    const tenant = await this.tenantModel.findOne({ where: { id: tenantId, isDeleted: false } })
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    const tenantResponse = await this.tenantModel.update(
      { isDeleted: true },
      {
        where: { id: tenantId, isDeleted: false },
      },
    );
    return tenantResponse;
  }
  public async update(tenantId: number, updateObj: TenantDto) {
    const tenant = await this.tenantModel.findOne({ where: { id: tenantId, isDeleted: false } })
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    const tenantResponse = await this.tenantModel.update(
      { ...updateObj },
      {
        where: { id: tenantId, isDeleted: false },
      },
    );
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

    const { count, rows } = await this.tenantModel.findAndCountAll({
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