import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { NotFoundException } from '@/exceptions/NotFoundException';
import { TenantDto } from '@/models/dtos/tenant.dto';
import { SortOrder } from '@/models/enums/sort-order.enum';
import { BelongsTo, Op } from 'sequelize';
import S3Services from '@/utils/services/s3.services';
import { TenantListRequestDto } from '@/models/dtos/tenant-list.dto';
import { insertDefaultRoles } from '@/utils/helpers/default.role.helper';
import { TenantMessage } from '@/utils/helpers/app-message.helper';
import { FileDestination } from '@/models/enums/file-destination.enum';
import { UserType } from '@/models/enums/user-types.enum';
import { TenantModel } from '@/models/db/tenant.model';
import { CommunicationHelper } from '@/utils/helpers/communication.helper';

export class TenantService {
	private tenantModel = DB.Tenant;
	public s3Service = new S3Services();
	public users = DB.Users;

	constructor() {}
	async add(tenantDetails: TenantDto, userId: number): Promise<number> {
		const gstNumber = tenantDetails?.gstNumber;

		if (gstNumber) {
			const regex = new RegExp('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');

			if (regex.test(gstNumber) == false) new BadRequestException(TenantMessage.invalidGstNumber);

			const gstNumberExists = await this.tenantModel.findOne({ where: { gstNumber: tenantDetails.gstNumber, isDeleted: false } });
			if (gstNumberExists) throw new BadRequestException(TenantMessage.gstNumberIsAlreadyExists);
		}

		const companyNameExists = await this.tenantModel.findOne({ where: { name: tenantDetails.name, isDeleted: false } });
		if (companyNameExists) throw new BadRequestException(TenantMessage.companyNameIsAlreadyExists);

		if (tenantDetails?.trademark) {
			const trademarkExists = await this.tenantModel.findOne({ where: { trademark: tenantDetails.trademark } });
			if (trademarkExists) throw new BadRequestException(TenantMessage.trademarkIsAlreadyExists);
		}

		const tenant = await this.tenantModel.create({
			...tenantDetails,
			createdBy: userId,
		});
		await insertDefaultRoles(tenant.id, userId);
		await CommunicationHelper.createWorkSpace(tenantDetails.name, tenant.id);
		if (tenantDetails?.logo) {
			const fileDestination = `${FileDestination.Tenant}/${tenant.id}`;
			const movedUrl = await this.s3Service.moveFileByUrl(tenantDetails.logo, fileDestination);

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
		}
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
	public async delete(tenantId: number, userId: number) {
		const tenant = await this.tenantModel.findOne({ where: { id: tenantId, isDeleted: false } });
		if (!tenant) {
			throw new NotFoundException(TenantMessage.tenantNotFound);
		}
		const tenantResponse = await this.tenantModel.update(
			{ isDeleted: true, updatedBy: userId },
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
				where: { trademark: updateObj.trademark, id: { [Op.ne]: tenantId } },
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

	public async list(pageModel: TenantListRequestDto, userId: number) {
		const validSortFields = Object.keys(TenantModel.rawAttributes);
		const sortField = validSortFields.includes(pageModel.sortField) ? pageModel.sortField : 'id';
		const sortOrder = Object.values(SortOrder).includes(pageModel.sortOrder as SortOrder) ? pageModel.sortOrder : SortOrder.ASC;

		const isPaginationEnabled = pageModel.page && pageModel.limit;

		const user = await this.users.findOne({
			where: {
				id: userId,
				isDeleted: false,
			},
		});

		let whereClause = {};
		if (pageModel.search) {
			whereClause = {
				[Op.or]: {
					name: { [Op.iLike]: `%${pageModel.search}%` },
					trademark: { [Op.iLike]: `%${pageModel.search}%` },
					authorisedEmail: { [Op.iLike]: `%${pageModel.search}%` },
				},
			};
		}

		let tenantDetails: TenantModel[];
		let totalTenantCount: number;

		if (user.userType !== UserType.ChiefAdmin) {
			if (user.tenantIds && user.tenantIds.length > 0) {
				// Fetch total tenant count without pagination
				totalTenantCount = await this.tenantModel.count({
					where: {
						id: {
							[Op.in]: user.tenantIds,
						},
						...whereClause,
						isDeleted: false,
						isActive: true,
					},
				});
				tenantDetails = await this.tenantModel.findAll({
					where: {
						id: {
							[Op.in]: user.tenantIds,
						},
						...whereClause,
						isDeleted: false,
						isActive: true,
					},
					order: [[sortField, sortOrder]],
					...(isPaginationEnabled && { limit: pageModel.limit, offset: (pageModel.page - 1) * pageModel.limit }), // Apply pagination if enabled
					include: [
						{
							association: new BelongsTo(this.users, this.tenantModel, { as: 'Creator', foreignKey: 'createdBy' }),
							attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
						},
						{
							association: new BelongsTo(this.users, this.tenantModel, { as: 'Updater', foreignKey: 'updatedBy' }),
							attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
						},
					],
				});
			}
		} else {
			totalTenantCount = await this.tenantModel.count({
				where: {
					...whereClause,
					isDeleted: false,
					isActive: true,
				},
			});

			tenantDetails = await this.tenantModel.findAll({
				where: {
					...whereClause,
					isDeleted: false,
					isActive: true,
				},
				order: [[sortField, sortOrder]],
				...(isPaginationEnabled && { limit: pageModel.limit, offset: (pageModel.page - 1) * pageModel.limit }), // Apply pagination if enabled
				include: [
					{
						association: new BelongsTo(this.users, this.tenantModel, { as: 'Creator', foreignKey: 'createdBy' }),
						attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
					},
					{
						association: new BelongsTo(this.users, this.tenantModel, { as: 'Updater', foreignKey: 'updatedBy' }),
						attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
					},
				],
			});
		}

		return {
			count: totalTenantCount,
			rows: tenantDetails,
		};
	}
}
