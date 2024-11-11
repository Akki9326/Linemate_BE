import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { CommunicationModel } from '@/models/db/communication.model';
import { Channel } from '@/models/enums/campaign.enums';
import { TemplateStatus } from '@/models/enums/template.enum';
import { TemplateGenerator } from '@/utils/helpers/template.helper';
import { logger } from '@/utils/services/logger';
import { BelongsTo } from 'sequelize';

export class TemplateCronService {
	private template = DB.Template;
	private communication = DB.CommunicationModel;
	private workSpaceModel = DB.WorkSpaceModel;

	async triggerListTemplate() {
		try {
			const communicationDetails = await this.fetchActiveCommunications();
			const templateArray = [];

			for (const item of communicationDetails) {
				if (item['workSpace']) {
					try {
						const workspaceTemplates = await this.fetchTemplatesForWorkspace(item['workSpace'].tenantId);
						templateArray.push(...workspaceTemplates);

						const fynoTemplateList = await TemplateGenerator.getExternalTemplateList(item['workSpace'].fynoWorkSpaceId);

						if (fynoTemplateList?.length || workspaceTemplates?.length) {
							await this.processTemplates(workspaceTemplates, fynoTemplateList, item);
						}

					} catch (ex) {
						logger.error(`Error Processing Template for Tenent # ${item['workSpace'].tenantId}. Ex: ${ex.message}`, ex);
					}
				}
			}

			return templateArray;
		} catch (error) {
			logger.error(`Error in triggerListTemplate:`, error);
		}
	}
	private async fetchActiveCommunications(): Promise<CommunicationModel[]> {
		return await this.communication.findAll({
			where: { isDeleted: false, channel: Channel.whatsapp },
			attributes: ['integrationId', 'workSpaceId'],
			include: [
				{
					association: new BelongsTo(this.communication, this.workSpaceModel, { as: 'workSpace', foreignKey: 'workSpaceId' }),
					attributes: ['fynoWorkSpaceId', 'tenantId'],
				},
			],
		});
	}

	private async fetchTemplatesForWorkspace(tenantId: number) {
		return await this.template.findAll({
			where: {
				tenantId,
				channel: Channel.whatsapp,
				status: TemplateStatus.DRAFT,
			},
		});
	}
	private async processTemplates(templates, fynoTemplateList, communicationItem) {
		for (const template of templates) {
			const matchingExternalTemplate = fynoTemplateList.find(extTemplate => extTemplate.name === template.name);
			if (matchingExternalTemplate) {
				const newStatus = matchingExternalTemplate.status.toLowerCase();
				const shouldCreateTemplate = newStatus === TemplateStatus.APPROVED;
				if (shouldCreateTemplate) {
					await this.createFynoTemplate(matchingExternalTemplate, communicationItem, template);
				}

				await this.updateTemplateStatus(template, newStatus, matchingExternalTemplate.template_id);
			}
		}
	}
	private async createFynoTemplate(matchingExternalTemplate, communicationItem, template) {
		const content = {
			content: {
				type: template?.templateType,
				content: matchingExternalTemplate.content,
			},
		};

		const payload = {
			name: template.name,
			event: {
				event_flow: {
					provider: {
						whatsapp: communicationItem?.integrationId,
					},
				},
			},
			template: {
				template_id: matchingExternalTemplate.template_id,
				channels: {
					whatsapp: content,
				},
				placeholders: {},
			},
		};

		await TemplateGenerator.createFynoTemplate(payload, { fynoWorkSpaceId: communicationItem['workSpace'].fynoWorkSpaceId });
	}

	private async updateTemplateStatus(template, newStatus, providerTemplateId) {
		await this.template.update(
			{
				status: newStatus,
				providerTemplateId: providerTemplateId,
			},
			{ where: { id: template.id } },
		);
	}
}
