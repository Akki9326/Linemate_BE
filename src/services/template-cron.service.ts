import DB from '@/databases';
import { CommunicationModel } from '@/models/db/communication.model';
import { TemplateModel } from '@/models/db/template.model';
import { Channel } from '@/models/enums/campaign.enums';
import { TemplateStatus } from '@/models/enums/template.enum';
import { TemplateGenerator } from '@/utils/helpers/template.helper';
import { logger } from '@/utils/services/logger';
import { BelongsTo, Op } from 'sequelize';
import { TemplateService } from './template.service';

export class TemplateCronService {
	private template = DB.Template;
	private templateService = new TemplateService();
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

						if (workspaceTemplates?.length) {
							const fynoTemplateList = await TemplateGenerator.getExternalTemplateList(item['workSpace'].fynoWorkSpaceId);
							if (fynoTemplateList?.length) {
								await this.processTemplates(workspaceTemplates, fynoTemplateList, item);
							}
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
				status: {
					[Op.in]: [TemplateStatus.DRAFT, TemplateStatus.PENDING],
				},
				isActive: true,
				isDeleted: false,
			},
		});
	}
	private async processTemplates(templates, fynoTemplateList, communicationItem) {
		for (const template of templates) {
			try {
				const matchingExternalTemplate = fynoTemplateList.find(extTemplate => extTemplate.name === template.name);
				if (matchingExternalTemplate) {
					const newStatus = matchingExternalTemplate.status.toLowerCase();
					const shouldCreateTemplate = newStatus === TemplateStatus.APPROVED;
					if (shouldCreateTemplate) {
						const resp = await this.createFynoTemplate(matchingExternalTemplate, communicationItem, template);
						await this.templateService.handleFynoTemplateResponse(resp, template, undefined);
					} else await this.updateTemplateStatus(template, newStatus, null);
				}
			} catch (ex) {
				logger.error(`Error Processing Template: ${template.id}-${template.name} . Ex: ${ex.message}`, ex);
			}
		}

	}
	private async createFynoTemplate(matchingExternalTemplate, communicationItem, template: TemplateModel) {
		const whatsapp = {
			content: {
				type: matchingExternalTemplate.type,
				language: matchingExternalTemplate.language,
				whatsapp_template_name: matchingExternalTemplate.name,
				wa_params: {
					external_template_data: {
						template_id: matchingExternalTemplate.template_id,
						name: matchingExternalTemplate.name,
						custom_name: matchingExternalTemplate.custom_name,
						language: matchingExternalTemplate.language,
						provider_name: 'Meta Facebook',
					},
					body: {},
				},
			},
		};

		const bodyPlaceHolder = {};
		const templatePlaceHolder = {};

		if (matchingExternalTemplate?.content?.body?.sample?.length) {
			matchingExternalTemplate.content.body.sample.forEach((key, index) => {
				bodyPlaceHolder['$' + (index + 1)] = `{{${key}}}`;
				templatePlaceHolder[key] = key;
			});

			whatsapp.content.wa_params['body'] = bodyPlaceHolder;
		}

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
					whatsapp,
				},
				placeholders: templatePlaceHolder,
			},
		};

		if (template.providerTemplateId) {
			return await TemplateGenerator.updateFynoTemplate(payload, template.name, { fynoWorkSpaceId: communicationItem['workSpace'].fynoWorkSpaceId });
		} else {
			return await TemplateGenerator.createFynoTemplate(payload, { fynoWorkSpaceId: communicationItem['workSpace'].fynoWorkSpaceId });
		}
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
