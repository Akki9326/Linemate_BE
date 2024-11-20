import DB from '@/databases';
import { Op, WhereOptions, BelongsTo, Sequelize } from 'sequelize';
import { AssignCampaign, CampaignActionDto, CampaignMasterDto } from '@/models/dtos/campaign.dto';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { AppMessages, CampaignMessage, TemplateMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import { applyingCampaign } from '@/utils/helpers/cohort.helper';
import { CampaignListRequestDto } from '@/models/dtos/campaign-list.dto';
import { CampaignMatrixDto } from '@/models/dtos/campaignMatrix.dto';
import { ReoccurenceType, CampaignStatusType, TriggerType, IntervalUnitType } from '@/models/enums/campaign.enums';
import { CampaignMasterModel } from '@/models/db/campaignMastel';
import { SortOrder } from '@/models/enums/sort-order.enum';
import { AssignCampaignUserId } from '@/models/interfaces/assignCampaign';
import {
	createCampaignOnFyno,
	fynoCampaignOverview,
	generateCsvFile,
	getCampaignPreview,
	getNotificationForCampaign,
	updateTemplateOnCampaign,
	fireCampaign,
} from '@/utils/helpers/campaign.helper';
import { FilterResponse } from '@/models/interfaces/filter.interface';
import { FilterKey } from '@/models/enums/filter.enum';
import { addDays, addMonths, addWeeks, parse, parseISO } from 'date-fns';
import { CommunicationService } from './communication.service';
import { CampaignMatrixModel } from '@/models/db/campaignMatrix';
import { CampaignTriggerMatrixModel } from '@/models/db/CampaignTriggerMatrix';
import { ReoccurenceDetails } from '@/models/interfaces/campaignMaster.interface';
import { enIN } from 'date-fns/locale';

export class CampaignService {
	private campaignMaster = DB.CampaignMaster;
	private campaignMatrix = DB.CampaignMatrix;
	private campaignUserMatrix = DB.CampaignUserMatrix;
	private user = DB.Users;
	private tenant = DB.Tenant;
	private template = DB.Template;
	private campaignTriggerMatrix = DB.CampaignTriggerMatrix;
	private sequelize: Sequelize;
	public communicationService = new CommunicationService();

	constructor() {
		this.sequelize = DB.sequelizeConnect;
	}

	public async add(campaignDetails: CampaignMasterDto, userId: number) {
		const transaction = await this.sequelize.transaction();
		try {
			const tenant = await this.tenant.findOne({
				where: {
					id: campaignDetails.tenantId,
					isDeleted: false,
				},
				transaction,
			});
			if (!tenant) {
				throw new BadRequestException(TenantMessage.tenantNotFound);
			}

			const nameTaken = await this.campaignMaster.findOne({
				where: {
					isDeleted: false,
					name: campaignDetails.name,
					tenantId: campaignDetails.tenantId,
				},
				transaction,
			});

			if (nameTaken) {
				throw new BadRequestException(CampaignMessage.campaignNameTaken);
			}

			if (campaignDetails?.rules?.length) {
				campaignDetails['userIds'] = (await applyingCampaign(campaignDetails?.tenantId, campaignDetails?.rules)) || [];
			}
			const template = await this.template.findOne({
				where: {
					id: campaignDetails.whatsappTemplateId,
				},
				transaction,
			});

			if (!template) {
				throw new BadRequestException(TemplateMessage.templateNotFound);
			}

			// if (!campaignUser.length) {
			// 	throw new BadRequestException("No user found in the campaign's rule criteria");
			// }
			// const fynoCampaignUploadId = await generateCsvFile(campaignUser);

			// const fynoCampaign = await createCampaignOnFyno(fynoCampaignUploadId?.upload_id, campaignDetails.name);
			// if (!fynoCampaign) {
			// 	throw new BadRequestException(CampaignMessage.cannotCreateCampaign);
			// }

			// const notifications = await getNotificationForCampaign(template.name);

			// await updateTemplateOnCampaign(fynoCampaign.upload_id, notifications);

			let campaign = new this.campaignMaster();
			campaign.name = campaignDetails.name;
			campaign.description = campaignDetails.description;
			campaign.channel = campaignDetails.channel;
			campaign.whatsappTemplateId = campaignDetails.whatsappTemplateId;
			campaign.viberTemplateId = campaignDetails.viberTemplateId;
			campaign.smsTemplateId = campaignDetails.smsTemplateId;
			campaign.tags = campaignDetails.tags;
			campaign.status = campaignDetails.status;
			campaign.isArchived = campaignDetails.isArchived;
			campaign.rules = campaignDetails.rules;
			campaign.tenantId = campaignDetails.tenantId;
			campaign.deliveryStatus = campaignDetails.deliveryStatus;
			// campaign.fynoCampaignId = fynoCampaign.upload_id;
			campaign.createdBy = userId;
			campaign.lastTriggerDate = null;

			if (campaignDetails?.reoccurenceType === ReoccurenceType.custom) {
				campaign.reoccurenceType = campaignDetails.reoccurenceType;
				campaign.reoccurenceDetails = campaignDetails.reoccurenceDetails;
			}

			if (campaignDetails?.reoccurenceType === ReoccurenceType.once) {
				campaign.reoccurenceType = campaignDetails.reoccurenceType;
				campaign.reoccurenceDetails = campaignDetails.reoccurenceDetails;
			}

			campaign.nextTriggerDate = await this.getNextTriggeredOn(campaign, []);
			campaign = await campaign.save({ transaction });
			await transaction.commit();
			if (campaignDetails?.userIds?.length) {
				await this.assignCampaign(campaign.id, campaignDetails, userId);
			}
			return { id: campaign.id };
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	public async update(campaignDetails: CampaignMasterDto, campaignId: number, userId: number) {
		const transaction = await this.sequelize.transaction();
		try {
			const campaign = await this.campaignMaster.findOne({
				where: { isDeleted: false, id: campaignId, status: { [Op.ne]: CampaignStatusType.inProgress } },
				transaction,
			});

			if (!campaign) {
				throw new BadRequestException(CampaignMessage.campaignInProgress);
			}

			const nameTaken = await this.campaignMaster.findOne({
				where: {
					isDeleted: false,
					name: campaignDetails.name,
					tenantId: campaignDetails.tenantId,
				},
				transaction,
			});

			if (nameTaken === null) {
				throw new BadRequestException(CampaignMessage.campaignNameTaken);
			}

			if (campaignDetails?.rules?.length) {
				campaignDetails['userIds'] = (await applyingCampaign(campaignDetails?.tenantId, campaignDetails?.rules)) || [];
			}

			campaign.name = campaignDetails?.name;
			campaign.description = campaignDetails.description;
			campaign.tenantId = campaignDetails.tenantId;
			campaign.rules = campaignDetails.rules;
			campaign.updatedBy = userId;
			campaign.channel = campaignDetails.channel;
			campaign.whatsappTemplateId = campaignDetails.whatsappTemplateId;
			campaign.viberTemplateId = campaignDetails.viberTemplateId;
			campaign.smsTemplateId = campaignDetails.smsTemplateId;
			campaign.tags = campaignDetails.tags;
			campaign.status = campaignDetails.status;
			campaign.isArchived = campaignDetails.isArchived;
			campaign.deliveryStatus = campaignDetails.deliveryStatus;

			if (campaignDetails?.reoccurenceType === ReoccurenceType.custom) {
				campaign.reoccurenceType = campaignDetails.reoccurenceType;
				campaign.reoccurenceDetails = campaignDetails?.reoccurenceDetails;
			}

			if (campaignDetails?.reoccurenceType === ReoccurenceType.once) {
				campaign.reoccurenceType = campaignDetails.reoccurenceType;
				campaign.reoccurenceDetails = campaignDetails?.reoccurenceDetails;
			}
			campaign.nextTriggerDate = await this.getNextTriggeredOn(campaign);
			const updatedCampaign = await campaign.save({ transaction });
			await transaction.commit();

			return { id: updatedCampaign.id };
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	public async one(campaignId: number) {
		const transaction = await this.sequelize.transaction();
		try {
			const campaign = await this.campaignMaster.findOne({
				where: {
					id: campaignId,
					isDeleted: false,
				},
				transaction,
				attributes: [
					'id',
					'name',
					'description',
					'rules',
					'tenantId',
					'createdAt',
					'tags',
					'status',
					'channel',
					'reoccurenceType',
					'reoccurenceDetails',
					'deliveryStatus',
					'whatsappTemplateId',
					'smsTemplateId',
					'viberTemplateId',
					'nextTriggerDate',
					'lastTriggerDate',
				],
				include: [
					{
						model: this.campaignUserMatrix,
						as: 'userMatrix',
						where: { isDeleted: false },
						attributes: ['userId'],
						include: [
							{
								model: this.user,
								attributes: ['firstName', 'lastName'],
							},
						],
						required: false,
					},
					{
						association: new BelongsTo(this.user, this.campaignMaster, { as: 'Creator', foreignKey: 'createdBy' }),
						attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
					},
					{
						association: new BelongsTo(this.user, this.campaignMaster, { as: 'Updater', foreignKey: 'updatedBy' }),
						attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
					},
				],
			});

			if (!campaign) {
				throw new BadRequestException(CampaignMessage.campaignNotFound);
			}
			return campaign;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	public async remove(campaignId: number, userId: number) {
		const transaction = await this.sequelize.transaction();
		try {
			const campaignMaster = await this.campaignMaster.findOne({
				where: {
					isDeleted: false,
					id: campaignId,
					status: { [Op.ne]: CampaignStatusType.inProgress },
				},
				transaction,
			});

			if (!campaignMaster) {
				throw new BadRequestException(CampaignMessage.campaignInProgress);
			}

			await this.campaignMaster.update(
				{
					isDeleted: true,
					updatedBy: userId,
				},
				{
					where: {
						id: campaignId,
					},
					transaction,
				},
			);

			await campaignMaster.save({ transaction });
			await transaction.commit();
			return campaignMaster.id;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	private async mappingDynamicFilter(condition: object, dynamicFilter: FilterResponse[]) {
		for (const filter of dynamicFilter) {
			if (filter.filterKey === FilterKey.LastTrigger) {
				const parsedStartDate = parseISO(String(filter.minValue));
				const parsedEndDate = parseISO(String(filter.maxValue));
				condition['lastTriggerDate'] = {
					[Op.between]: [new Date(parsedStartDate), new Date(parsedEndDate)],
				};
			}
			if (filter.filterKey === FilterKey.NextTrigger) {
				const parsedStartDate = parseISO(String(filter.minValue));
				const parsedEndDate = parseISO(String(filter.maxValue));
				condition['nextTriggerDate'] = {
					[Op.between]: [new Date(parsedStartDate), new Date(parsedEndDate)],
				};
			}
			if (filter.filterKey === FilterKey.Status && filter?.selectedValue) {
				condition['status'] = filter.selectedValue;
			}
			if (filter.filterKey === FilterKey.CampaignTag && filter?.selectedValue) {
				condition['tags'] = {
					[Op.contains]: [filter.selectedValue],
				};
			}
			if (filter.filterKey === FilterKey.Channel && filter?.selectedValue) {
				condition['channel'] = {
					[Op.in]: filter.selectedValue,
				};
			}
		}
	}

	public async all(pageModel: CampaignListRequestDto, tenantId: number) {
		const { page = 1, limit = 10 } = pageModel;
		const validSortFields = Object.keys(CampaignMasterModel.rawAttributes);
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

		if (pageModel?.filter) {
			if (pageModel?.filter?.isArchive == true || pageModel?.filter?.isArchive == false) {
				condition.isArchived = pageModel?.filter?.isArchive;
			}

			if (pageModel?.filter?.dynamicFilter && pageModel?.filter?.dynamicFilter?.length) {
				await this.mappingDynamicFilter(condition, pageModel.filter.dynamicFilter);
			}
		}

		const campaignResult = await this.campaignMaster.findAll({
			where: condition,
			offset,
			limit,
			order: [[sortField, sortOrder]],
			include: [
				{
					model: this.campaignTriggerMatrix,
					as: 'campaignTriggers',
					where: { isFired: true },
					attributes: ['id', 'firedOn', 'fireType'],
					order: [['firedOn', 'DESC']],
					required: false,
				},
				{
					association: new BelongsTo(this.user, this.campaignMaster, { as: 'Creator', foreignKey: 'createdBy' }),
					attributes: ['id', 'firstName', 'lastName'],
				},
				{
					association: new BelongsTo(this.user, this.campaignMaster, { as: 'Updater', foreignKey: 'updatedBy' }),
					attributes: ['id', 'firstName', 'lastName'],
				},
				{
					association: new BelongsTo(this.tenant, this.campaignMaster, { as: 'Tenant', foreignKey: 'id' }),
					attributes: ['id', 'name', 'companyType', 'phoneNumber'],
				},
			],
		});

		const count = await this.campaignMaster.count({
			where: condition,
		});

		return {
			count,
			rows: campaignResult.map(cr => {
				return {
					...cr.dataValues,
				};
			}),
		};
	}

	private async getNextTriggeredOn(campaign: CampaignMasterModel, triggerDetails: CampaignTriggerMatrixModel[] = null) {
		let existingTriggers;
		if (triggerDetails) {
			existingTriggers = triggerDetails;
		}
		else {
			existingTriggers = await this.campaignTriggerMatrix.findAll({
				where: { isFired: true, id: campaign.id },
				attributes: ['id', 'firedOn', 'fireType'],
				order: [['firedOn', 'DESC']],
			});
		}
		const reoccurenceDetails = campaign.reoccurenceDetails as ReoccurenceDetails;
		if (campaign.reoccurenceType == ReoccurenceType.custom) {
			const startDateTime = parse(`${reoccurenceDetails.time}`, 'HH:mm', new Date(reoccurenceDetails.startDate), {
				locale: enIN,
			});

			if (reoccurenceDetails && startDateTime >= new Date()) {
				return startDateTime;
			}

			if (reoccurenceDetails.endDate) {
				const endDateTime = parse(`${reoccurenceDetails.time}`, 'HH:mm', new Date(reoccurenceDetails.endDate), {
					locale: enIN,
				});

				if (reoccurenceDetails && endDateTime < new Date()) {
					return null;
				}
			}

			if (
				reoccurenceDetails.afterOccurences > 0 &&
				existingTriggers.filter(ct => ct.fireType == TriggerType.automatic).length >= reoccurenceDetails.afterOccurences
			) {
				return null;
			}

			let nextSchedule = startDateTime;
			while (nextSchedule < new Date()) {
				if (reoccurenceDetails.intervalTimeUnit == IntervalUnitType.day) {
					nextSchedule = addDays(nextSchedule, 1);
				} else if (reoccurenceDetails.intervalTimeUnit == IntervalUnitType.week) {
					nextSchedule = addWeeks(nextSchedule, 1);
				} else if (reoccurenceDetails.intervalTimeUnit == IntervalUnitType.month) {
					nextSchedule = addMonths(nextSchedule, 1);
				}
			}

			return nextSchedule;
		} else if (campaign.reoccurenceType == ReoccurenceType.once) {
			if (existingTriggers.filter(ct => ct.fireType == TriggerType.automatic).length) return null;
			else
				return parse(`${reoccurenceDetails.time}`, 'HH:mm', new Date(), {
					locale: enIN,
				});
		}
	}

	public async getTagsByTenant(tenantId: number) {
		const ctags = await this.campaignMaster.findAll({
			where: {
				isDeleted: false,
				tenantId: tenantId,
			},
			attributes: ['tags'],
		});

		const allTags = ctags
			.map(c => c.tags)
			.reduce(function (a, b) {
				return a.concat(b);
			}, []);

		return Array.from(new Set(allTags));
	}

	public async addTrigger(triggerDetails: CampaignMatrixDto, userId: number) {
		const campaign = new this.campaignMatrix();

		if (!triggerDetails.campaignId) {
			throw new BadRequestException(CampaignMessage.campaignNotFound);
		}

		campaign.campaignId = triggerDetails.campaignId;
		campaign.triggerType = triggerDetails.triggerType;
		campaign.triggered = triggerDetails.triggered;
		campaign.delivered = triggerDetails.delivered;
		campaign.read = triggerDetails.read;
		campaign.clicked = triggerDetails.clicked;
		campaign.failed = triggerDetails.failed;
		campaign.createdBy = userId;

		await campaign.save();

		return {
			id: campaign.id,
		};
	}

	public async removeTrigger(campaignId: number, userId: number) {
		const campaignMaster = await this.campaignMatrix.findOne({
			where: {
				isDeleted: false,
				id: campaignId,
			},
		});

		if (!campaignMaster) {
			throw new BadRequestException(CampaignMessage.campaignNotFound);
		}

		await this.campaignMatrix.update(
			{
				isDeleted: true,
				updatedBy: userId,
			},
			{
				where: {
					id: campaignId,
				},
			},
		);

		await campaignMaster.save();
		return campaignMaster.id;
	}

	public async updateTrigger(campaignId: number, triggerDetails: CampaignMatrixDto, userId: number) {
		const campaign = await this.campaignMatrix.findOne({
			where: {
				isDeleted: false,
				id: campaignId,
			},
		});

		if (!campaign) {
			throw new BadRequestException(CampaignMessage.campaignNotFound);
		}

		campaign.triggerType = triggerDetails.triggerType;
		campaign.triggered = triggerDetails.triggered;
		campaign.delivered = triggerDetails.delivered;
		campaign.read = triggerDetails.read;
		campaign.clicked = triggerDetails.clicked;
		campaign.failed = triggerDetails.failed;
		campaign.updatedBy = userId;

		await campaign.save();
		return {
			id: campaign.id,
		};
	}

	public getTriggers(campaignId: number) {
		return this.campaignMatrix.findAll({
			where: {
				isDeleted: false,
				campaignId,
			},
		});
	}

	public async cloneCampaign(campaignId: number, userId: number) {
		const campaignExist = await this.campaignMaster.findOne({
			where: { isDeleted: false, id: campaignId, status: { [Op.ne]: CampaignStatusType.inProgress } },
		});

		if (!campaignExist) {
			throw new BadRequestException(CampaignMessage.campaignInProgress);
		}
		const campaign = new this.campaignMaster();
		campaign.name = 'copy ' + campaignExist.name;
		campaign.channel = campaignExist.channel;
		campaign.description = campaignExist.description;
		campaign.whatsappTemplateId = campaignExist.whatsappTemplateId;
		campaign.viberTemplateId = campaignExist.viberTemplateId;
		campaign.smsTemplateId = campaignExist.smsTemplateId;
		campaign.tags = campaignExist.tags;
		campaign.status = campaignExist.status;
		campaign.isArchived = campaignExist.isArchived;
		campaign.rules = campaignExist.rules;
		campaign.tenantId = campaignExist.tenantId;
		campaign.deliveryStatus = campaignExist.deliveryStatus;
		campaign.createdBy = userId;

		if (campaignExist?.reoccurenceType === ReoccurenceType.custom) {
			campaign.reoccurenceType = campaignExist.reoccurenceType;
			campaign.reoccurenceDetails = campaignExist?.reoccurenceDetails;
		}

		if (campaignExist?.reoccurenceType === ReoccurenceType.once) {
			campaign.reoccurenceType = campaignExist.reoccurenceType;
			campaign.reoccurenceDetails = campaignExist?.reoccurenceDetails;
		}

		await campaign.save();
		return {
			id: campaign.id,
		};
	}

	public async assignMultiCampaign(assignCampaignBody: AssignCampaign, userId: number) {
		await Promise.all(
			assignCampaignBody?.campaignId.map(async campaignId => {
				const campaignDetails = {
					userIds: assignCampaignBody?.userIds,
				};
				await this.assignCampaign(campaignId, campaignDetails, userId);
			}),
		);
	}

	public async assignCampaign(campaignId: number, campaignDetails: AssignCampaignUserId, creatorId: number) {
		const transaction = await this.sequelize.transaction();
		try {
			const campaignExists = await this.campaignMaster.findOne({
				where: { id: campaignId },
				transaction,
			});

			if (!campaignExists) {
				throw new BadRequestException(`Campaign with ID ${campaignId} does not exist`);
			}
			campaignDetails.userIds = Array.from(new Set(campaignDetails.userIds));
			const existingUsers = await this.user.findAll({
				where: {
					id: {
						[Op.in]: campaignDetails.userIds,
					},
				},
				attributes: ['id'],
				transaction,
			});

			const existingUserIds = existingUsers.map(user => user.id);
			const validUserIds = campaignDetails.userIds.filter(userId => existingUserIds.includes(userId));

			if (validUserIds.length) {
				const existingCampaignMatrixRecords = await this.campaignUserMatrix.findAll({
					where: {
						campaignId: campaignId,
					},
					attributes: ['userId', 'isDeleted'],
					transaction,
				});

				const existingCampaignMatrixUserIds = existingCampaignMatrixRecords.map(record => record.userId.toString());

				const recordsToReactivate = existingCampaignMatrixRecords
					.filter(record => validUserIds.includes(parseInt(record.userId)) && record.isDeleted === true)
					.map(record => record.userId);

				const recordsToDelete = existingCampaignMatrixRecords
					.filter(record => !validUserIds.includes(parseInt(record.userId)) && record.isDeleted === false)
					.map(record => record.userId);

				const newUserIds = validUserIds.filter(userId => !existingCampaignMatrixUserIds.includes(userId.toString()));

				if (recordsToReactivate.length) {
					await this.campaignUserMatrix.update(
						{ isDeleted: false, updatedBy: creatorId },
						{
							where: {
								campaignId: campaignId,
								userId: {
									[Op.in]: recordsToReactivate,
								},
								transaction,
							},
						},
					);
				}
				if (recordsToDelete.length) {
					await this.campaignUserMatrix.update(
						{ isDeleted: true, updatedBy: creatorId },
						{
							where: {
								campaignId: campaignId,
								userId: {
									[Op.in]: recordsToDelete,
								},
								transaction,
							},
						},
					);
				}

				const CampaignMatrixRecords = newUserIds.map(userId => ({
					campaignId: campaignId,
					userId: userId,
					createdBy: creatorId, // Add the creatorId here
				}));
				await this.campaignUserMatrix.bulkCreate(CampaignMatrixRecords, { transaction });
				await transaction.commit();
			}
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	public async getCamapignAnalytics(campaignId: number) {
		const campaign = await this.campaignMaster.findOne({
			where: {
				id: campaignId,
				isDeleted: false,
			},
			attributes: ['id', 'name', 'reoccurenceType', 'channel', 'tenantId'],
		});

		if (!campaign) {
			throw new BadRequestException(CampaignMessage.campaignNotFound);
		}
		const workspaceId = await this.communicationService.getWorkspaceId(campaign.tenantId);

		const campaignTriggerMatrixList = await this.campaignTriggerMatrix.findAll({
			where: {
				campaignId,
				isFired: true,
			},
			include: [
				{
					association: new BelongsTo(DB.Users, this.campaignTriggerMatrix, { as: 'creator', foreignKey: 'createdBy' }),
					attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
					required: false,
				},
			],
		});

		const campaignAnalytics = [];
		for (const campaignTriggerMatrix of campaignTriggerMatrixList) {
			const existingMaxtrix = await this.campaignMatrix.findOne({
				where: {
					campaignTriggerMatrixId: campaignTriggerMatrix.id,
				},
			});

			if (!existingMaxtrix) {
				const campaignPreview = await getCampaignPreview(workspaceId, campaignTriggerMatrix.fynoCampaignId);

				let campaignOverview = await fynoCampaignOverview(workspaceId, campaignPreview);
				if (campaignOverview.length <= 0) {
					campaignAnalytics.push(this.parseCampaignAnalytics(campaign, campaignTriggerMatrix, null));
					continue;
				}

				campaignOverview = campaignOverview.reduce((result, item) => {
					if (!result[item.status]) {
						result[item.status] = 0;
					}
					result[item.status] += item.total_requests;
					return result;
				}, {});

				const campaignMatrix = new this.campaignMatrix();
				campaignMatrix.campaignId = campaignId;
				campaignMatrix.triggerType = campaignTriggerMatrix.fireType;
				campaignMatrix.triggered = (campaignOverview.Delivered || 0) + (campaignOverview.Undelivered || 0);
				campaignMatrix.delivered = campaignOverview.Delivered || 0;
				campaignMatrix.read = campaignOverview?.Read || 0;
				campaignMatrix.clicked = campaignOverview?.clicked || 0;
				campaignMatrix.failed = campaignOverview?.Undelivered || 0;
				campaignMatrix.createdBy = campaignTriggerMatrix.createdBy;
				campaignMatrix.campaignTriggerMatrixId = campaignTriggerMatrix.id;

				await campaignMatrix.save();

				campaignAnalytics.push(this.parseCampaignAnalytics(campaign, campaignTriggerMatrix, campaignMatrix));
			} else {
				campaignAnalytics.push(this.parseCampaignAnalytics(campaign, campaignTriggerMatrix, existingMaxtrix));
			}
		}
		return campaignAnalytics;
	}

	private parseCampaignAnalytics(
		campaign: CampaignMasterModel,
		campaignAnalyticMatrix: CampaignTriggerMatrixModel,
		campaignMatrix: CampaignMatrixModel,
	) {
		return {
			triggeredOn: campaignAnalyticMatrix.firedOn,
			triggedBy: campaignAnalyticMatrix.creator,
			channel: campaign.channel,
			triggerType: campaignAnalyticMatrix.fireType,
			analytics: campaignMatrix,
		};
	}

	public async fireCampaign(campiagnId: number, triggerType = TriggerType.manual) {
		const campign = await this.campaignMaster.findOne({
			where: {
				id: campiagnId,
				isDeleted: false,
			},
		});

		if (!campign) {
			throw new BadRequestException(CampaignMessage.campaignNotFound);
		}

		const newCampaignName = `${campign.name}-${new Date().getTime()}`;

		let userIds;
		if (campign?.rules.length) {
			userIds = (await applyingCampaign(campign.tenantId, campign?.rules)) || [];
		}

		const campaignUser = await this.user.findAll({
			where: {
				id: {
					[Op.in]: userIds,
				},
				tenantIds: {
					[Op.contains]: [campign.tenantId],
				},
			},
		});

		const workspaceId = await this.communicationService.getWorkspaceId(campign.tenantId);
		const template = await this.template.findOne({
			where: {
				id: campign.whatsappTemplateId,
			},
		});

		if (!template) {
			throw new BadRequestException(TemplateMessage.templateNotFound);
		}

		if (!campaignUser.length) {
			throw new BadRequestException("No user found in the campaign's rule criteria");
		}

		const fynoCampaignUploadId = await generateCsvFile(workspaceId, campaignUser);

		const fynoCampaign = await createCampaignOnFyno(workspaceId, fynoCampaignUploadId?.upload_id, newCampaignName);
		if (!fynoCampaign) {
			throw new BadRequestException(CampaignMessage.cannotCreateCampaign);
		}

		const notifications = await getNotificationForCampaign(workspaceId, template.name);

		await updateTemplateOnCampaign(workspaceId, fynoCampaign.upload_id, notifications);

		const now = new Date();

		await fireCampaign(workspaceId, fynoCampaign.upload_id);

		const triggerDetails = {
			fireType: triggerType,
			campaignId: campiagnId,
			fynoCampaignId: fynoCampaign.upload_id,
			firedOn: now,
			isFired: true,
		};

		await this.campaignTriggerMatrix.create(triggerDetails);
		const nextTriggerDate = await this.getNextTriggeredOn(campign);
		await this.campaignMaster.update(
			{ lastTriggerDate: now, nextTriggerDate },
			{
				where: {
					id: campiagnId,
				},
			},
		);

		return {
			id: campiagnId,
		};
	}

	public async automaticFiredCampaign(campiagnId: number) {
		return this.fireCampaign(campiagnId, TriggerType.automatic);
	}

	public async unArchive(campaignIds: CampaignActionDto, userId: number) {
		const campaignToUnArchive = await this.campaignMaster.findAll({
			where: {
				id: {
					[Op.in]: campaignIds,
				},
				isDeleted: false,
			},
		});
		if (!campaignToUnArchive.length) {
			throw new BadRequestException(CampaignMessage.notFoundUnArchiveCampaign);
		}
		for (const campaign of campaignToUnArchive) {
			campaign.isArchived = false;
			campaign.updatedBy = userId;
			await campaign.save();
		}
		return campaignToUnArchive.map(campaign => ({ id: campaign.id }));
	}
	public async archive(campaignIds: CampaignActionDto, userId: number) {
		const campaignToArchive = await this.campaignMaster.findAll({
			where: {
				id: {
					[Op.in]: campaignIds,
				},
				isDeleted: false,
			},
		});
		if (!campaignToArchive.length) {
			throw new BadRequestException(CampaignMessage.notFoundArchiveCampaign);
		}
		for (const campaign of campaignToArchive) {
			campaign.isArchived = true;
			campaign.updatedBy = userId;
			await campaign.save();
		}
		return campaignToArchive.map(campaign => ({ id: campaign.id }));
	}

	public async bulkDelete(campaignIds: CampaignActionDto, userId: number) {
		const campaignToDelete = await this.campaignMaster.findAll({
			where: {
				id: {
					[Op.in]: campaignIds,
				},
				isDeleted: false,
			},
		});
		if (!campaignToDelete.length) {
			throw new BadRequestException(CampaignMessage.notFoundDeleteCampaign);
		}
		for (const campaign of campaignToDelete) {
			campaign.isDeleted = true;
			campaign.updatedBy = userId;
			await campaign.save();
		}
		return campaignToDelete.map(campaign => ({ id: campaign.id }));
	}
}
