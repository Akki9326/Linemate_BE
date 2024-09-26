/* eslint-disable @typescript-eslint/no-explicit-any */
import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { TemplateModel } from '@/models/db/template.model';
import { FileDto, FileMediaType } from '@/models/dtos/file.dto';
import { TemplateButtonDto, TemplateDto } from '@/models/dtos/template-dto';
import { TemplateListRequestDto } from '@/models/dtos/template-list.dto';
import { TemplateStatus, TemplateType } from '@/models/enums/template.enum';
import { ExternalTemplatePayload } from '@/models/interfaces/template.interface';
import { AppMessages, TemplateMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import { TemplateGenerator } from '@/utils/helpers/template.helper';
import S3Services from '@/utils/services/s3.services';
import { parseISO } from 'date-fns';
import { BelongsTo, Op, Sequelize, Transaction, WhereOptions } from 'sequelize';

export class TemplateService {
	public users = DB.Users;
	public template = DB.Template;
	public templateContentButtonsSection = DB.TemplateContentButtonsSection;
	public templateContent = DB.TemplateContent;
	public templateContentCards = DB.TemplateContentCards;
	public templateContentButtons = DB.TemplateContentButtons;
	public s3Service = new S3Services();
	private sequelize: Sequelize;
	constructor() {
		this.sequelize = DB.sequelizeConnect;
	}

	public async add(templateDetails: TemplateDto, userId: number) {
		const transaction = await this.sequelize.transaction(); // Start a transaction
		try {
			const template = await this.createTemplate(templateDetails, userId, transaction);
			const templateContent = await this.createTemplateContent(templateDetails, template.id, userId, transaction);
			await this.addButtonsToTemplateContent(templateDetails, templateContent.id, userId, transaction);
			await this.addContentCards(templateDetails, templateContent.id, userId, transaction);

			let payload = {};
			payload = await this.generateTemplate(templateDetails, template);

			await transaction.commit(); // Commit the transaction if all is successful
			return { id: template.id, payload };
		} catch (error) {
			await transaction.rollback(); // Rollback if any error occurs
			throw error; // Re-throw the error to handle it as needed
		}
	}

	private async createTemplate(templateDetails: TemplateDto, userId: number, transaction: Transaction) {
		const existingTemplate = await this.template.findOne({ where: { name: templateDetails.name }, transaction });
		if (existingTemplate) {
			throw new BadRequestException(TemplateMessage.templateAlreadyExists);
		}
		if (templateDetails?.body?.length > 1032) {
			throw new BadRequestException('The body content exceeds the maximum allowed length of 1032 characters.');
		}
		if (templateDetails?.footer?.length > 60) {
			throw new BadRequestException('The footer content exceeds the maximum allowed length of 60 characters.');
		}

		const template = new this.template();
		Object.assign(template, {
			name: templateDetails.name,
			description: templateDetails.description,
			clientTemplateId: templateDetails.clientTemplateId,
			HSMUserId: templateDetails.HSMUserId,
			HSMPassword: templateDetails.HSMPassword,
			ISDCode: templateDetails.ISDCode,
			businessContactNumber: templateDetails.businessNumber,
			channel: templateDetails.channel,
			templateType: templateDetails.templateType,
			language: templateDetails.language,
			tenantId: templateDetails.tenantId,
			createdBy: userId,
		});

		await template.save({ transaction });
		return template;
	}

	private async createTemplateContent(templateDetails: TemplateDto, templateId: number, userId: number, transaction: Transaction) {
		const templateContent = new this.templateContent();
		Object.assign(templateContent, {
			headerType: templateDetails.headerType,
			headerMediaType: templateDetails.headerMediaType,
			headerContent: templateDetails.headerContent,
			headerPlaceHolder: templateDetails.headerPlaceHolder,
			body: templateDetails.body,
			bodyPlaceHolder: templateDetails.bodyPlaceHolder,
			footer: templateDetails.footer,
			contentType: templateDetails.contentType,
			isPreviewUrl: templateDetails.isPreviewUrl,
			headerMediaUrl: templateDetails.headerMediaUrl,
			locationName: templateDetails.locationName,
			address: templateDetails.address,
			messageText: templateDetails.messageText,
			actionType: templateDetails.actionType || null,
			menuButtonName: templateDetails.menuButtonName || null,
			templateId: templateId,
			createdBy: userId,
		});

		await templateContent.save({ transaction });
		return templateContent;
	}

	private async addButtonsToTemplateContent(templateDetails: TemplateDto, templateContentId: number, userId: number, transaction: Transaction) {
		const buttonIds: number[] = [];
		const processButton = async (buttonDetail: any, sectionId: number) => {
			const contentButton = new this.templateContentButtons();
			Object.assign(contentButton, {
				buttonType: buttonDetail.buttonType || null,
				title: buttonDetail.title,
				websiteUrl: buttonDetail.websiteUrl,
				isDynamicUrl: buttonDetail.isDynamicUrl,
				navigateScreen: buttonDetail.navigateScreen,
				initialScreen: buttonDetail.initialScreen,
				flowId: buttonDetail.flowId,
				flowAction: buttonDetail.flowAction,
				flowToken: buttonDetail.flowToken,
				isTrackUrl: buttonDetail.isTrackUrl,
				buttonId: buttonDetail.buttonId,
				additionalData: buttonDetail.additionalData,
				buttonDescription: buttonDetail.buttonDescription,
				createdBy: userId,
				sectionId: sectionId,
			});
			await contentButton.save({ transaction });
			buttonIds.push(contentButton.id);
		};

		if (templateDetails.buttons && templateDetails.buttons?.length > 0 && templateDetails.buttons[0].sectionName) {
			for (const section of templateDetails.buttons) {
				let sectionRecord = await this.templateContentButtonsSection.findOne({ where: { name: section.sectionName }, transaction });
				if (!sectionRecord) {
					sectionRecord = new this.templateContentButtonsSection();
					sectionRecord.name = section.sectionName;
					await sectionRecord.save({ transaction });
				}

				for (const buttonDetail of section.buttons) {
					await processButton(buttonDetail, sectionRecord.id);
				}
			}
		} else {
			for (const buttonDetail of templateDetails.buttons || []) {
				await processButton(buttonDetail, null);
			}
		}

		const templateContent = await this.templateContent.findOne({ where: { id: templateContentId }, transaction });
		templateContent.buttonIds = buttonIds;
		await templateContent.save({ transaction });
	}

	private async addContentCards(templateDetails: TemplateDto, templateContentId: number, userId: number, transaction: Transaction) {
		if (templateDetails?.contentCards?.length > 10) {
			throw new BadRequestException('The number of content cards exceeds the maximum allowed limit of 10.');
		}
		for (const card of templateDetails?.contentCards || []) {
			if (card.body?.length > 160) {
				throw new BadRequestException('The card body content exceeds the maximum allowed length of 160 characters.');
			}

			const contentCard = new this.templateContentCards();
			Object.assign(contentCard, {
				mediaType: card.mediaType,
				contentUrl: card.contentUrl,
				mediaHandle: card.mediaHandle,
				body: card.body,
				bodyPlaceHolder: card.bodyPlaceHolder,
				templateContentId: templateContentId,
				createdBy: userId,
			});
			await contentCard.save({ transaction });

			await this.addButtonsToContentCard(card.buttons, contentCard.id, userId, transaction);
		}
	}

	private async addButtonsToContentCard(buttons: TemplateButtonDto[], contentCardId: number, userId: number, transaction: Transaction) {
		const cardButtonIds: number[] = [];

		for (const buttonDetail of buttons || []) {
			if (buttonDetail.title?.length > 25) {
				throw new BadRequestException('The card button title exceeds the maximum allowed length of 25 characters.');
			}
			if (buttonDetail.websiteUrl?.length > 2000) {
				throw new BadRequestException('The card button websiteUrl exceeds the maximum allowed length of 2000 characters.');
			}
			const cardButton = new this.templateContentButtons();
			Object.assign(cardButton, {
				buttonType: buttonDetail.buttonType || null,
				title: buttonDetail.title,
				websiteUrl: buttonDetail.websiteUrl,
				isDynamicUrl: buttonDetail.isDynamicUrl,
				navigateScreen: buttonDetail.navigateScreen,
				initialScreen: buttonDetail.initialScreen,
				flowId: buttonDetail.flowId,
				flowAction: buttonDetail.flowAction,
				flowToken: buttonDetail.flowToken,
				isTrackUrl: buttonDetail.isTrackUrl,
				createdBy: userId,
			});
			await cardButton.save({ transaction });
			cardButtonIds.push(cardButton.id);
		}

		const contentCard = await this.templateContentCards.findOne({ where: { id: contentCardId }, transaction });
		contentCard.buttonIds = cardButtonIds;
		await contentCard.save({ transaction });
	}

	private async generateTemplate(templateDetails: TemplateDto, template: TemplateModel) {
		let payload = {};

		if (templateDetails.templateType === TemplateType.ExternalTemplate) {
			payload = TemplateGenerator.externalTemplatePayload(templateDetails);
			const response = await TemplateGenerator.createExternalTemplate(payload);
			await this.handleExternalTemplateResponse(response, template, templateDetails, payload as ExternalTemplatePayload);
		} else {
			payload = TemplateGenerator.fynoTemplatePayload(templateDetails);
			const response = await TemplateGenerator.createFynoTemplate(payload);
			await this.handleFynoTemplateResponse(response, template);
		}

		return payload;
	}

	private async handleExternalTemplateResponse(
		response: any,
		template: TemplateModel,
		templateDetails: TemplateDto,
		payload: ExternalTemplatePayload,
	) {
		let notificationPayload = {};
		if (response[0].status === TemplateStatus.ERROR) {
			template.status = response[0].status || TemplateStatus.ERROR;
			await template.save();
			throw new BadRequestException(response[0]?._message?.error_user_msg || response[0]?._message?.message || 'Error saving template.');
		} else {
			template.status = TemplateStatus[response[0]?.message?.status];
			template.providerTemplateId = response[0]?.message?.id;
			if (
				TemplateStatus[response[0]?.message?.status] === TemplateStatus.APPROVED ||
				TemplateStatus[response[0]?.message?.status] === TemplateStatus.PENDING
			) {
				notificationPayload = TemplateGenerator.externalNotificationPayload(templateDetails, payload as ExternalTemplatePayload);
				await TemplateGenerator.createFynoTemplate(notificationPayload);
			}
			await template.save();
		}
	}

	private async handleFynoTemplateResponse(response: any, template: TemplateModel) {
		if (response.status === TemplateStatus.ERROR) {
			template.status = response.status;
			await template.save();
			throw new BadRequestException(response?._message || 'Error saving template.');
		} else {
			template.status = TemplateStatus.APPROVED;
			await template.save();
		}
	}

	public async update(templateDetails: TemplateDto, templateId: number, userId: number) {
		let providerTemplateId;
		// const template = await this.template.findOne({
		// 	where: { id: templateId, isDeleted: false },
		// });
		// if (!templateId) {
		// 	throw new BadRequestException(TemplateMessage.templateNotFound);
		// }
		// if (!template.providerTemplateId) {
		// 	providerTemplateId = await this.assignProviderTemplateId(template);
		// } else {
		// 	providerTemplateId = template.providerTemplateId;
		// }
		console.log('providerTemplateId', providerTemplateId);
		console.log('userId', userId);
	}

	public async one(templateId: number) {
		const template = await this.template.findOne({
			where: { id: templateId, isDeleted: false },
			attributes: [
				'id',
				'name',
				'description',
				'templateType',
				'clientTemplateId',
				'HSMUserId',
				'HSMPassword',
				'ISDCode',
				'businessContactNumber',
				'language',
				'status',
				'tenantId',
			],
			include: [
				{
					model: this.templateContent,
					as: 'templateContent',
					where: { isDeleted: false },
					include: [
						{
							model: this.templateContentCards,
							as: 'templateContentCards',
							where: { isDeleted: false },
							attributes: ['mediaType', 'contentUrl', 'body', 'bodyPlaceHolder', 'buttonIds'],
							required: false,
						},
					],
					attributes: [
						'contentType',
						'headerType',
						'headerContent',
						'headerPlaceHolder',
						'headerMediaType',
						'body',
						'bodyPlaceHolder',
						'footer',
						'contentUrl',
						'caption',
						'latitude',
						'longitude',
						'address',
						'isPreviewUrl',
						'messageType',
						'buttonIds',
						'contentSubType',
						'actionType',
						'menuButtonName',
					],
					required: false,
				},
				{
					association: new BelongsTo(this.users, this.template, { as: 'Creator', foreignKey: 'createdBy' }),
					attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
				},
				{
					association: new BelongsTo(this.users, this.template, { as: 'Updater', foreignKey: 'updatedBy' }),
					attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
				},
			],
		});

		if (!template) {
			throw new BadRequestException(TemplateMessage.templateNotFound);
		}
		const allButtonIds = new Set<number>();

		if (template?.dataValues.templateContent && template?.dataValues.templateContent?.length > 0) {
			for (const content of template?.dataValues.templateContent || []) {
				if (content.buttonIds && content.buttonIds?.length > 0) {
					content.buttonIds.forEach((id: number) => allButtonIds.add(id));
				}

				if (content.templateContentCards && content.templateContentCards.length > 0) {
					for (const card of content.templateContentCards) {
						if (card.buttonIds && card.buttonIds?.length > 0) {
							card.buttonIds.forEach((id: number) => allButtonIds.add(id));
						}
					}
				}
			}
		}

		const buttonDetails = await this.templateContentButtons.findAll({
			where: {
				id: Array.from(allButtonIds),
				isDeleted: false,
			},
			attributes: [
				'id',
				'title',
				'buttonType',
				'websiteUrl',
				'isDynamicUrl',
				'navigateScreen',
				'initialScreen',
				'flowId',
				'flowAction',
				'flowToken',
				'isTrackUrl',
				'buttonId',
				'additionalData',
				'sectionId', // Include sectionId
			],
		});

		const sectionIds = new Set<number>();
		buttonDetails.forEach(button => {
			if (button.sectionId) {
				sectionIds.add(button.sectionId);
			}
		});

		const sectionDetails = await this.templateContentButtonsSection.findAll({
			where: {
				id: Array.from(sectionIds),
			},
			attributes: ['id', 'name'],
		});

		const sectionMap = sectionDetails.reduce((map: any, section: any) => {
			map[section.id] = section.name;
			return map;
		}, {});

		const buttonMap = buttonDetails.reduce((map: any, button: any) => {
			map[button.id] = button;
			return map;
		}, {});

		if (template?.dataValues.templateContent && template?.dataValues.templateContent?.length > 0) {
			for (const content of template?.dataValues.templateContent || []) {
				if (content.buttonIds && content.buttonIds?.length > 0) {
					const groupedButtons = content.buttonIds
						.map((id: number) => buttonMap[id] || null)
						.filter((button: any) => button !== null)
						.reduce((acc: any, button: any) => {
							const sectionId = button.sectionId || 'no_section';
							if (!acc[sectionId]) {
								acc[sectionId] = {
									sectionName: sectionId === 'no_section' ? null : sectionMap[sectionId],
									buttons: [],
								};
							}
							acc[sectionId].buttons.push(button);
							return acc;
						}, {});

					content.dataValues.buttons = Object.values(groupedButtons)
						.map((group: any) => {
							if (group.sectionName) {
								return group;
							} else {
								return group.buttons;
							}
						})
						.flat();
				}

				if (content.templateContentCards && content.templateContentCards?.length > 0) {
					for (const card of content.templateContentCards) {
						if (card.buttonIds && card.buttonIds?.length > 0) {
							const groupedButtons = card.buttonIds
								.map((id: number) => buttonMap[id] || null)
								.filter((button: any) => button !== null)
								.reduce((acc: any, button: any) => {
									const sectionId = button.sectionId || 'no_section';
									if (!acc[sectionId]) {
										acc[sectionId] = {
											sectionName: sectionId === 'no_section' ? null : sectionMap[sectionId],
											buttons: [],
										};
									}
									acc[sectionId].buttons.push(button);
									return acc;
								}, {});

							card.dataValues.buttons = Object.values(groupedButtons)
								.map((group: any) => {
									if (group.sectionName) {
										return group;
									} else {
										return group.buttons;
									}
								})
								.flat();
						}
					}
				}
			}
		}
		return template;
	}

	public async delete(templateId: number, userId: number) {
		const template = await this.template.findOne({
			where: { id: templateId, isDeleted: false },
		});

		if (!template) {
			throw new BadRequestException(TemplateMessage.templateNotFound);
		}
		await this.template.update(
			{ isDeleted: true, updatedBy: userId },
			{
				where: {
					id: templateId,
					isDeleted: false,
				},
			},
		);

		return { id: template.id };
	}

	public async all(pageModel: TemplateListRequestDto, tenantId: number) {
		const { page = 1, limit = 10, sortField = 'id', sortOrder = 'ASC' } = pageModel;
		const offset = (page - 1) * limit;
		let condition: WhereOptions = { isDeleted: false };

		if (!tenantId) {
			throw new BadRequestException(AppMessages.headerTenantId);
		}
		if (pageModel.filter.isDeleted) {
			condition.isDeleted = pageModel.filter.isDeleted;
		}
		if (pageModel.filter.channel) {
			condition.channel = pageModel.filter.channel;
		}
		if (pageModel.filter.status) {
			condition.status = pageModel.filter.status;
		}
		if (pageModel.filter.startDate && pageModel.filter.endDate) {
			const parsedStartDate = parseISO(String(pageModel.filter.startDate));
			const parsedEndDate = parseISO(String(pageModel.filter.endDate));
			condition.createdAt = {
				[Op.between]: [new Date(parsedStartDate), new Date(parsedEndDate)],
			};
		}
		if (pageModel.filter.createdBy) {
			condition.createdBy = pageModel.filter.createdBy;
		}
		if (pageModel.filter.language) {
			condition.language = pageModel.filter.language;
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
		const templateResult = await this.template.findAndCountAll({
			where: condition,
			offset,
			limit,
			order: [[sortField, sortOrder]],
			attributes: ['id', 'name', 'description', 'channel', 'language', 'status'],
			include: [
				{
					association: new BelongsTo(this.users, this.template, { as: 'Creator', foreignKey: 'createdBy' }),
					attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
				},
				{
					association: new BelongsTo(this.users, this.template, { as: 'Updater', foreignKey: 'updatedBy' }),
					attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
				},
			],
		});

		return templateResult;
	}

	public async uploadTemplateFile(file: FileDto, requestBody: FileMediaType) {
		const { isValid, allowedMimeTypes } = TemplateGenerator.validateMimeType(file.mimetype, requestBody.mediaType);
		if (!isValid) {
			throw new BadRequestException(`Invalid file type for the specified media type. Allowed types: ${allowedMimeTypes.join(', ')}`);
		}
		if (!requestBody?.tenantId) {
			throw new BadRequestException(TenantMessage.requiredTenantId);
		}
		const dir = `tenant/${requestBody?.tenantId}/templates/${file.name}`;

		const imageUrl = await this.s3Service.uploadS3(file.data, dir, file.mimetype);
		const s3Response: { imageUrl: string; id?: number } = {
			imageUrl,
		};
		const response = await TemplateGenerator.uploadFynoFile(file);
		return {
			handler: response?.meta_handler,
			file: s3Response?.imageUrl,
			sample: response?.file.split('uploads/')[1] || '',
		};
	}
}
