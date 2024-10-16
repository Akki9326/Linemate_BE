import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { CohortListDto } from '@/models/dtos/cohort-list.dto';
import { AssignCohort, CohortDto } from '@/models/dtos/cohort.dto';
import { CohortRuleDataTypes, RuleOperators, RuleTypes } from '@/models/enums/cohort.enum';
import { AssignCohortUserId } from '@/models/interfaces/assignCohort';
import { FilterCondition, FilterResponse } from '@/models/interfaces/filter.interface';
import { AppMessages, CohortMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import { applyingCohort } from '@/utils/helpers/cohort.helper';
import { isValid, parseISO } from 'date-fns';
import { BelongsTo, Op, Sequelize, WhereOptions } from 'sequelize';
import VariableServices from './variable.service';
import { FilterKey } from '@/models/enums/filter.enum';
import { CohortMasterModel } from '@/models/db/cohortMaster.model';
import { SortOrder } from '@/models/enums/sort-order.enum';

export class CohortService {
	private cohortMaster = DB.CohortMaster;
	private cohortMatrix = DB.CohortMatrix;
	private users = DB.Users;
	private tenant = DB.Tenant;
	private variableMatrix = DB.VariableMatrix;
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
				variableId: variable.id,
			}));
		} catch (error) {
			return [];
		}
	}

	public async ruleOptions(tenantId: number) {
		if (!tenantId) {
			throw new BadRequestException(AppMessages.headerTenantId);
		}
		const cohortsList = await this.cohortMaster.findAll({
			where: { tenantId: tenantId, isDeleted: false },
			attributes: ['id', 'name'],
		});

		const customVariable = await this.getCustomFields(tenantId);
		const response = [
			{
				title: RuleTypes.Cohort,
				type: CohortRuleDataTypes.DropDown,
				options: cohortsList,
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

	public async assignCohort(cohortId: number, cohortDetails: AssignCohortUserId, creatorId: number) {
		cohortDetails.userIds = Array.from(new Set(cohortDetails.userIds));
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
					{ isDeleted: false, updatedBy: creatorId },
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
					{ isDeleted: true, updatedBy: creatorId },
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
		if (cohortDetails?.rules?.length && cohortDetails.isExistingRuleProcess) {
			cohortDetails['userIds'] = (await applyingCohort(cohortDetails?.rules)) || [];
		}

		let cohort = new this.cohortMaster();
		cohort.name = cohortDetails.name;
		cohort.description = cohortDetails.description;
		cohort.rules = cohortDetails.rules;
		cohort.tenantId = cohortDetails.tenantId;
		cohort.createdBy = userId;
		cohort.isExistingRuleProcess = cohortDetails.isExistingRuleProcess;
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
		if (!cohort) {
			throw new BadRequestException(CohortMessage.cohortNotFound);
		}
		if (cohortDetails?.rules?.length && cohortDetails.isExistingRuleProcess) {
			cohortDetails['userIds'] = (await applyingCohort(cohortDetails?.rules)) || [];
		}
		cohort.name = cohortDetails.name;
		cohort.description = cohortDetails.description;
		cohort.tenantId = cohortDetails.tenantId;
		cohort.rules = cohortDetails.rules;
		cohort.updatedBy = userId;
		cohort.isExistingRuleProcess = cohortDetails.isExistingRuleProcess;
		if (cohortDetails?.userIds?.length) {
			await this.assignCohort(cohort.id, cohortDetails, userId);
		}
		await cohort.save();
		return cohort.id;
	}

	public async one(contentId: number) {
		const cohort = await this.cohortMaster.findOne({
			where: { id: contentId, isDeleted: false },
			attributes: ['id', 'name', 'description', 'rules', 'isExistingRuleProcess', 'tenantId', 'createdAt'],
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
					required: false,
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

	private async getCohortIdsFromVariableMatrix(filterCriteria: { variableId: number; value: string }[], condition: FilterCondition) {
		const whereConditions = filterCriteria.map(criteria => {
			const jsonStringValue = JSON.stringify([criteria.value]);
			return {
				variableId: criteria.variableId,
				[Op.or]: [{ value: { [Op.like]: `%${criteria.value}%` } }, { value: { [Op.like]: `%${jsonStringValue}%` } }],
			};
		});

		const havingClause = filterCriteria.map(criteria =>
			Sequelize.literal(`COUNT(DISTINCT CASE WHEN "variableId" = ${criteria.variableId} AND "value" = '${criteria.value}' THEN 1 END) > 0`),
		);

		const matchingRecords = await this.variableMatrix.findAll({
			where: {
				[Op.or]: whereConditions,
			},
			attributes: ['userId'],
			group: ['userId'],
			having: {
				[Op.and]: havingClause,
			},
		});

		const matchingUserIds = Array.from(new Set(matchingRecords.map(record => record.userId)));

		const cohortMatrixRecords = await this.cohortMatrix.findAll({
			where: {
				userId: {
					[Op.in]: matchingUserIds,
				},
			},
			attributes: ['cohortId'],
			group: ['cohortId'],
		});

		const cohortIds = cohortMatrixRecords.map(record => record.cohortId);
		const combinedCohortIds = Array.from(new Set([...cohortIds, condition.id]));

		condition = {
			...condition,
			id: { [Op.in]: combinedCohortIds.filter(id => typeof id === 'number') },
		};
		return condition;
	}

	private async mappingDynamicFilter(condition: FilterCondition, dynamicFilter: FilterResponse[]) {
		const variableList = dynamicFilter
			.filter(filter => 'variableId' in filter && 'selectedValue' in filter)
			.map(filter => ({
				value: filter.selectedValue,
				variableId: filter.variableId,
			}));

		for (const filter of dynamicFilter) {
			if (filter.filterKey === FilterKey.JoiningDate) {
				if (isValid(filter.minValue) && isValid(filter.maxValue)) {
					const parsedStartDate = parseISO(String(filter.minValue));
					const parsedEndDate = parseISO(String(filter.maxValue));
					condition['createdAt'] = {
						[Op.between]: [new Date(parsedStartDate), new Date(parsedEndDate)],
					};
				}
			}
			if (filter.filterKey === FilterKey.Cohort && filter?.selectedValue) {
				condition['id'] = filter?.selectedValue;
			}
		}
		condition = await this.getCohortIdsFromVariableMatrix(variableList, condition);
		return condition;
	}

	public async all(pageModel: CohortListDto, tenantId: number) {
		const { page = 1, limit = 10 } = pageModel;
		const validSortFields = Object.keys(CohortMasterModel.rawAttributes).concat(['EnrolledUserCount']);
		const sortField = validSortFields.includes(pageModel.sortField) ? pageModel.sortField : 'id';
		const sortOrder = Object.values(SortOrder).includes(pageModel.sortOrder as SortOrder) ? pageModel.sortOrder : SortOrder.ASC;
		const offset = (page - 1) * limit;
		let condition: WhereOptions = { isDeleted: false };

		if (!tenantId) {
			throw new BadRequestException(AppMessages.headerTenantId);
		}

		if (tenantId) {
			condition.tenantId = tenantId;
		}

		if (pageModel?.search) {
			condition = {
				...condition,
				name: { [Op.iLike]: `%${pageModel.search}%` },
			};
		}
		if (pageModel.filter) {
			if (pageModel.filter.dynamicFilter && pageModel.filter.dynamicFilter.length) {
				condition = {
					...condition,
					...(await this.mappingDynamicFilter(condition, pageModel.filter.dynamicFilter)),
				};
			}
		}
		const totalCohortCount = await this.cohortMaster.count({
			where: condition,
		});
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
					required: false,
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
			group: ['CohortMasterModel.id', 'Creator.id', 'Updater.id'],
			subQuery: false,
		});

		return {
			count: totalCohortCount,
			rows: cohortResult,
		};
	}

	public async assignMultiCohort(assignCohortBody: AssignCohort, userId: number) {
		await Promise.all(
			assignCohortBody?.cohortIds.map(async cohortId => {
				const cohortDetails = {
					userIds: assignCohortBody?.userIds,
				};
				await this.assignCohort(cohortId, cohortDetails, userId);
			}),
		);
	}
	public async getCohortByUserId(userId: number[]) {
		const condition = {
			userId: {
				[Op.in]: userId,
			},
		};

		const cohortResult = await this.cohortMaster.findAll({
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
					where: { isDeleted: false, ...condition },
					as: 'userMatrix',
					attributes: [],
					required: true,
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
			group: ['CohortMasterModel.id', 'Creator.id', 'Updater.id'],
			subQuery: false,
		});

		return cohortResult;
	}

	public async cohortByTenantId(tenantId: number) {
		const cohort = await this.cohortMaster.findAll({
			where: { tenantId, isDeleted: false },
			attributes: ['id', 'name'],
		});

		return cohort;
	}

	public async getUserByCohortId(cohortId: number) {
		const user = await this.cohortMatrix.findAll({
			where: { cohortId, isDeleted: false },
			attributes: ['userId'],
		});
		return user.map(user => user.userId);
	}
}
