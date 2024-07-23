import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { NotFoundException } from '@/exceptions/NotFoundException';
import { TenantDto } from '@/models/dtos/tenant.dto';
import { SortOrder } from '@/models/enums/sort-order.enum';
import { Op } from 'sequelize';
import S3Services from '@/utils/services/s3.services';
import { TenantListRequestDto } from '@/models/dtos/tenant-list.dto';
import { insertDefaultRoles } from '@/utils/helpers/default.role.helper';
import { TenantMessage } from '@/utils/helpers/app-message.helper';
import { FileDestination } from '@/models/enums/file-destination.enum';

export class TenantService {
	private tenantModel = DB.Tenant;
	public s3Service = new S3Services();

	constructor() {}
	async add(tenantDetails: TenantDto, userId: number): Promise<number> {
		const gstNumber = tenantDetails.gstNumber;

		const regex = new RegExp('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');

		if (regex.test(gstNumber) == false) new BadRequestException(TenantMessage.invalidGstNumber);

		const gstNumberExists = await this.tenantModel.findOne({ where: { gstNumber: tenantDetails.gstNumber, isDeleted: false } });
		if (gstNumberExists) throw new BadRequestException(TenantMessage.gstNumberIsAlreadyExists);

		const companyNameExists = await this.tenantModel.findOne({ where: { name: tenantDetails.name, isDeleted: false } });
		if (companyNameExists) throw new BadRequestException(TenantMessage.companyNameIsAlreadyExists);

		const trademarkExists = await this.tenantModel.findOne({ where: { trademark: tenantDetails.trademark, isDeleted: false } });
		if (trademarkExists) throw new BadRequestException(TenantMessage.trademarkIsAlreadyExists);

		const tenant = await this.tenantModel.create({
			...tenantDetails,
			createdBy: userId,
		});
		await insertDefaultRoles(tenant.id, userId);

		const movedUrl = await this.s3Service.moveFileByUrl(tenantDetails.logo, FileDestination.Tenant, tenant.id);

		await this.tenantModel.update(
			{
				logo: movedUrl,
			},
			{
				where: {
					id: tenant.id,
				},
			},
		);
		return tenant.id;
	}
	public async one(tenantId: number) {
		const tenantResponse = await this.tenantModel.findOne({
			where: { id: tenantId, isDeleted: false },
		});
		if (!tenantResponse) {
			throw new NotFoundException(TenantMessage.tenantNotFound);
		}
		return tenantResponse;
	}
	public async delete(tenantId: number) {
		const tenant = await this.tenantModel.findOne({ where: { id: tenantId, isDeleted: false } });
		if (!tenant) {
			throw new NotFoundException(TenantMessage.tenantNotFound);
		}
		const tenantResponse = await this.tenantModel.update(
			{ isDeleted: true },
			{
				where: { id: tenantId, isDeleted: false },
			},
		);
		return tenantResponse;
	}
	public async update(tenantId: number, updateObj: TenantDto, userId: number) {
		const tenant = await this.tenantModel.findOne({ where: { id: tenantId, isDeleted: false } });
		if (!tenant) throw new NotFoundException(TenantMessage.tenantNotFound);

		if (updateObj.gstNumber) {
			const regex = new RegExp('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');

			if (regex.test(updateObj.gstNumber) == false) new BadRequestException(TenantMessage.invalidGstNumber);

			const gstNumberExists = await this.tenantModel.findOne({
				where: { gstNumber: updateObj.gstNumber, isDeleted: false, id: { [Op.ne]: tenantId } },
				raw: true,
			});
			if (gstNumberExists) throw new BadRequestException(TenantMessage.gstNumberIsAlreadyExists);
		}

		if (updateObj.name) {
			const companyNameExists = await this.tenantModel.findOne({
				where: { name: updateObj.name, isDeleted: false, id: { [Op.ne]: tenantId } },
				raw: true,
			});
			if (companyNameExists) throw new BadRequestException(TenantMessage.companyNameIsAlreadyExists);
		}

		if (updateObj.trademark) {
			const trademarkExists = await this.tenantModel.findOne({
				where: { trademark: updateObj.trademark, isDeleted: false, id: { [Op.ne]: tenantId } },
				raw: true,
			});
			if (trademarkExists) throw new BadRequestException(TenantMessage.trademarkIsAlreadyExists);
		}

		const tenantResponse = await this.tenantModel.update(
			{ ...updateObj, updatedBy: userId },
			{
				where: { id: tenantId, isDeleted: false },
			},
		);
		return tenantResponse;
	}

	public async list(pageModel: TenantListRequestDto) {
		const { page, pageSize, search, sortField, sortOrder } = pageModel;

		let whereClause = {};
		if (search) {
			whereClause = {
				...whereClause,
				[Op.or]: {
					name: { [Op.iLike]: `%${pageModel.search}%` },
					trademark: { [Op.iLike]: `%${pageModel.search}%` },
					authorisedEmail: { [Op.iLike]: `%${pageModel.search}%` },
				},
			};
		}
		const { count, rows } = await this.tenantModel.findAndCountAll({
			where: {
				...whereClause,
				isActive: true,
				isDeleted: false,
			},
			// nest: true,
			distinct: true,
			order: [[sortField || 'id', sortOrder || SortOrder.ASC]],
			limit: pageSize,
			offset: (page - 1) * pageSize,
		});

		return {
			total: count,
			data: rows,
		};
	}
}
