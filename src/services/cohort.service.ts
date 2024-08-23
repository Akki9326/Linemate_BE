import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { CohortDto } from '@/models/dtos/cohort.dto';
import { CohortRuleDataTypes, RuleOperators, RuleTypes } from '@/models/enums/cohort.enum';
import { CohortMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import { BelongsTo, Op, Sequelize, WhereOptions } from 'sequelize';
import VariableServices from './variable.service';
import { CohortListDto } from '@/models/dtos/cohort-list.dto';

export class CohortService {
	private cohortMaster = DB.CohortMaster;
	private cohortMatrix = DB.CohortMatrix;
	private users = DB.Users;
	private tenant = DB.Tenant;
	private variableServices = new VariableServices();

	constructor() {}

	public async getCustomFields(tenantId: number) {
		try {
			const customVariables = await this.variableServices.getVariableByTenantId(tenantId);
			return customVariables.map(variable => ({
				title: variable.name,
				type: CohortRuleDataTypes.DropDown,
				options: variable.options || [],
				operators: [RuleOperators.EQUAL],
			}));
		} catch (error) {
			return [];
		}
	}

	public async ruleOptions(tenantId: number) {
		// const cohortsList = await this.cohort.findAll({
		// 	where: { tenantId: tenantId, isDeleted: false },
		// 	attributes: ['id', 'name'],
		// });
		const customVariable = await this.getCustomFields(tenantId);
		const response = [
			{
				title: RuleTypes.Cohort,
				type: CohortRuleDataTypes.DropDown,
				options: [],
				operators: [RuleOperators.EQUAL],
			},
			{
				title: RuleTypes.JoiningDate,
				type: CohortRuleDataTypes.Date,
				operators: [RuleOperators.LESS_THAN, RuleOperators.GREATER_THAN, RuleOperators.BETWEEN],
			},
			...customVariable,
		];
		return response;
	}

	public async assignCohort(cohortId: number, cohortDetails: CohortDto, creatorId: number) {
		const existingUsers = await this.users.findAll({
			where: {
				id: {
					[Op.in]: cohortDetails.userIds,
				},
			},
			attributes: ['id'],
		});

		const existingUserIds = existingUsers.map(user => user.id);
		const validUserIds = cohortDetails.userIds.filter(userId => existingUserIds.includes(userId));

		if (validUserIds.length) {
			const existingCohortMatrixRecords = await this.cohortMatrix.findAll({
				where: {
					cohortId: cohortId,
				},
				attributes: ['userId', 'isDeleted'],
			});

			const existingCohortMatrixUserIds = existingCohortMatrixRecords.map(record => record.userId.toString());

			const recordsToReactivate = existingCohortMatrixRecords
				.filter(record => validUserIds.includes(parseInt(record.userId)) && record.isDeleted === true)
				.map(record => record.userId);

			const recordsToDelete = existingCohortMatrixRecords
				.filter(record => !validUserIds.includes(parseInt(record.userId)) && record.isDeleted === false)
				.map(record => record.userId);

			const newUserIds = validUserIds.filter(userId => !existingCohortMatrixUserIds.includes(userId.toString()));
			if (recordsToReactivate.length) {
				await this.cohortMatrix.update(
					{ isDeleted: false },
					{
						where: {
							cohortId: cohortId,
							userId: {
								[Op.in]: recordsToReactivate,
							},
						},
					},
				);
			}
			if (recordsToDelete.length) {
				await this.cohortMatrix.update(
					{ isDeleted: true },
					{
						where: {
							cohortId: cohortId,
							userId: {
								[Op.in]: recordsToDelete,
							},
						},
					},
				);
			}

			const cohortMatrixRecords = newUserIds.map(userId => ({
				cohortId: cohortId,
				userId: userId,
				createdBy: creatorId, // Add the creatorId here
			}));
			await this.cohortMatrix.bulkCreate(cohortMatrixRecords);
		}
	}

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
		let cohort = new this.cohortMaster();
		cohort.name = cohortDetails.name;
		cohort.description = cohortDetails.description;
		cohort.rules = cohortDetails.rules;
		cohort.tenantId = cohortDetails.tenantId;
		cohort.createdBy = userId;
		cohort = await cohort.save();
		if (cohortDetails?.userIds?.length) {
			await this.assignCohort(cohort.id, cohortDetails, userId);
		}

		return { id: cohort.id };
	}

	public async update(cohortDetails: CohortDto, cohortId: number, userId: number) {
		const cohort = await this.cohortMaster.findOne({
			where: { isDeleted: false, id: cohortId },
		});

		if (!cohortId) {
			throw new BadRequestException(CohortMessage.cohortNotFound);
		}
		cohort.name = cohortDetails.name;
		cohort.description = cohortDetails.description;
		cohort.tenantId = cohortDetails.tenantId;
		cohort.updatedBy = userId;
		if (cohortDetails?.userIds?.length) {
			await this.assignCohort(cohort.id, cohortDetails, userId);
		}
		await cohort.save();
		return cohort.id;
	}

	public async one(contentId: number) {
		const cohort = await this.cohortMaster.findOne({
			where: { id: contentId, isDeleted: false },
			attributes: ['id', 'name', 'description', 'tenantId', 'createdAt'],
			include: [
				{
					model: this.cohortMatrix,
					as: 'userMatrix',
					where: { isDeleted: false },
					attributes: ['userId'],
					include: [
						{
							model: this.users,
							attributes: ['firstName', 'lastName'],
						},
					],
				},
				{
					association: new BelongsTo(this.users, this.cohortMaster, { as: 'Creator', foreignKey: 'createdBy' }),
					attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
				},
				{
					association: new BelongsTo(this.users, this.cohortMaster, { as: 'Updater', foreignKey: 'updatedBy' }),
					attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
				},
			],
		});

		if (!cohort) {
			throw new BadRequestException(CohortMessage.cohortNotFound);
		}
		return cohort;
	}

	public async remove(cohortId: number, userId: number) {
		const cohortMaster = await this.cohortMaster.findOne({
			where: { isDeleted: false, id: cohortId },
		});

		if (!cohortMaster) {
			throw new BadRequestException(CohortMessage.cohortNotFound);
		}

		cohortMaster.set({
			isDeleted: true,
			updatedBy: userId,
		});
		await this.cohortMatrix.update(
			{
				isDeleted: true,
				updatedBy: userId,
			},
			{
				where: { isDeleted: false, cohortId: cohortId },
			},
		);

		await cohortMaster.save();
		return cohortMaster.id;
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

		const cohortResult = await this.cohortMaster.findAll({
			where: condition,
			offset,
			limit,
			order: [[sortField, sortOrder]],
			attributes: [
				'id',
				'name',
				'createdAt',
				'tenantId',
				'description',
				[Sequelize.fn('COUNT', Sequelize.col('userMatrix.userId')), 'EnrolledUserCount'],
			],
			include: [
				{
					model: this.cohortMatrix,
					where: { isDeleted: false },
					as: 'userMatrix',
					attributes: [],
				},
				{
					association: new BelongsTo(this.users, this.cohortMaster, { as: 'Creator', foreignKey: 'createdBy' }),
					attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
				},
				{
					association: new BelongsTo(this.users, this.cohortMaster, { as: 'Updater', foreignKey: 'updatedBy' }),
					attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
				},
			],
			group: ['CohortMasterModel.id', 'Creator.id', 'Updater.id'], // Group by the cohort's id
			subQuery: false,
		});

		return {
			count: cohortResult?.length,
			rows: cohortResult,
		};
	}
}
