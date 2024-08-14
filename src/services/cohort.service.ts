import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { CohortListDto } from '@/models/dtos/cohort-list.dto';
import { AssignCohort, CohortDto } from '@/models/dtos/cohort.dto';
import { AppMessages, CohortMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import { BelongsTo, Op, WhereOptions } from 'sequelize';
import UserService from './user.service';

export class CohortService {
	private cohort = DB.Cohort;
	private user = DB.Users;
	private tenant = DB.Tenant;
	public userService = new UserService();

	constructor() {}

	public async add(cohortDetails: CohortDto, userId: number) {
		const tenant = await this.tenant.findOne({
			where: {
				id: cohortDetails.tenantId,
				isDeleted: false,
			},
		});
		if (!tenant) {
			throw new BadRequestException(TenantMessage.tenantNotFound);
		}
		let cohort = new this.cohort();
		cohort.name = cohortDetails.name;
		cohort.description = cohortDetails.description;
		cohort.tenantId = cohortDetails.tenantId;
		cohort.createdBy = userId;
		cohort = await cohort.save();
		return { id: cohort.id };
	}

	public async update(cohortDetails: CohortDto, cohortId: number, userId: number) {
		const cohort = await this.cohort.findOne({
			where: { isDeleted: false, id: cohortId },
		});

		if (!cohortId) {
			throw new BadRequestException(CohortMessage.cohortNotFound);
		}
		cohort.name = cohortDetails.name;
		cohort.description = cohortDetails.description;
		cohort.tenantId = cohortDetails.tenantId;
		cohort.userIds = cohortDetails.userIds;
		cohort.updatedBy = userId;

		await cohort.save();
		return cohort.id;
	}

	// Get Cohort Details By cohortId
	public async one(contentId: number) {
		const cohort = await this.cohort.findOne({
			where: { id: contentId, isDeleted: false },
			attributes: ['id', 'name', 'description', 'tenantId', 'createdAt'],
		});

		if (!cohort) {
			throw new BadRequestException(CohortMessage.cohortNotFound);
		}
		return cohort;
	}

	public async all(pageModel: CohortListDto, tenantId: number) {
		const { page = 1, limit = 10, sortField = 'id', sortOrder = 'ASC' } = pageModel;
		const offset = (page - 1) * limit;
		let condition: WhereOptions = { isDeleted: false };
		if (tenantId) {
			condition.tenantId = tenantId;
		}
		if (pageModel?.search) {
			condition = {
				...condition,
				name: { [Op.iLike]: `%${pageModel.search}%` },
			};
		}
		console.log('condition', condition);

		const cohortResult = await this.cohort.findAndCountAll({
			where: condition,
			offset,
			limit: limit,
			order: [[sortField, sortOrder]],
			attributes: ['id', 'name', 'createdAt', 'tenantId', 'description'],
			include: [
				{
					association: new BelongsTo(this.user, this.cohort, { as: 'Creator', foreignKey: 'createdBy' }),
					attributes: ['id', 'firstName', 'lastName'],
				},
			],
		});

		return cohortResult;
	}
	public async assignCohort(assignCohort: AssignCohort, creatorId: number) {
		const { userIds, cohortIds } = assignCohort;
		const cohorts = await this.cohort.findAll({
			where: {
				id: { [Op.in]: cohortIds },
			},
		});

		if (!cohorts) {
			throw new BadRequestException(CohortMessage.cohortNotFound);
		}

		const users = await this.user.findAll({
			where: {
				id: { [Op.in]: userIds },
			},
		});

		if (!users) {
			throw new BadRequestException(AppMessages.userNotFound);
		}

		for (const cohort of cohorts) {
			cohort.userIds = [...cohort.userIds, ...userIds];
			cohort.updatedBy = creatorId;
			await cohort.save();
		}

		return { message: 'Cohort assigned successfully' };
	}

	public async remove(cohortId: number, userId: number) {
		const cohort = await this.cohort.findOne({
			where: { isDeleted: false, id: cohortId },
		});

		if (!cohort) {
			throw new BadRequestException(CohortMessage.cohortNotFound);
		}

		cohort.set({
			isDeleted: true,
			updatedBy: userId,
		});

		await cohort.save();
		return cohort.id;
	}
}
