import DB from '@/databases';
import { BelongsTo, Op, Sequelize, WhereOptions } from 'sequelize';
import { CampaignMasterDto } from '@/models/dtos/campaign.dto';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { AppMessages, CampaignMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import { applyingCampaign } from '@/utils/helpers/cohort.helper';
import { CampaignListDto } from '@/models/dtos/campaign-list.dto';

export class CampaignService {
	private campaignMaster = DB.CampaignMaster;
	private user = DB.Users;
	private tenant = DB.Tenant;
	constuructor() {}

	public async add(campaignDetails: CampaignMasterDto, userId: number) {
		const tenant = await this.tenant.findOne({
			where: {
				id: campaignDetails.tenantId,
				isDeleted: false,
			},
		});
		if (!tenant) {
			throw new BadRequestException(TenantMessage.tenantNotFound);
		}

		if (campaignDetails?.rules?.length) {
			campaignDetails['userIds'] = (await applyingCampaign(campaignDetails?.rules)) || [];
		}

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
		campaign = await campaign.save();

		return { id: campaign.id };
	}

	public async one(campaignId: number) {
		const campaign = await this.campaignMaster.findOne({
			where: {
				id: campaignId,
				isDeleted: false,
			},
			attributes: ['id', 'name', 'description', 'rules', 'tenantId', 'createdAt'],
		});

		if (!campaign) {
			throw new BadRequestException(CampaignMessage.campaignNotFound);
		}
		return campaign;
	}

	public async remove(campaignId: number, userId: number) {
		const campaignMaster = await this.campaignMaster.findOne({
			where: {
				isDeleted: false,
				id: campaignId,
			},
		});

		if (!campaignMaster) {
			throw new BadRequestException(CampaignMessage.campaignNotFound);
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
			},
		);

		await campaignMaster.save();
		return campaignMaster.id;
	}

	public async all(pageModel: CampaignListDto, tenantId: number) {
		const { page = 1, limit = 10, sortField = 'id', sortOrder = 'ASC' } = pageModel;
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
				//  search by template name pending
			};
		}

		console.log(pageModel);

		if (pageModel?.filter) {
			const { tags, channel, status, isArchived } = pageModel.filter;

			condition = {
				...condition,
				...(tags && { tags: { [Op.contains]: tags } }),
				...(channel && { channel: { [Op.contains]: channel } }),
				...(status && { status }),
				...(isArchived !== undefined && { isArchived }),
				// Trigger filters pending
			};
		}

		const campaignResule = await this.campaignMaster.findAll({
			where: condition,
			offset,
			limit,
			order: [[sortField, sortOrder]],
		});
		return {
			count: campaignResule?.length,
			rows: campaignResule,
		};
	}
}
