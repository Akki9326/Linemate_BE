import { TemplateActionDto } from '@/models/dtos/template-dto';
/* eslint-disable @typescript-eslint/no-explicit-any */
import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { TemplateModel } from '@/models/db/template.model';
import { TemplateContentCardsModel } from '@/models/db/templateContentCard.model';
import { FileDto, FileMediaType } from '@/models/dtos/file.dto';
import { TemplateButtonDto, TemplateDto } from '@/models/dtos/template-dto';
import { TemplateListRequestDto } from '@/models/dtos/template-list.dto';
import { FilterKey } from '@/models/enums/filter.enum';
import { SortOrder } from '@/models/enums/sort-order.enum';
import { ButtonType, MediaType, TemplateStatus, TemplateType } from '@/models/enums/template.enum';
import { FilterResponse } from '@/models/interfaces/filter.interface';
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
		const transaction = await this.sequelize.transaction();
		try {
			const template = await this.createOrUpdateTemplate(templateDetails, userId, transaction);
			const templateContent = await this.createOrUpdateTemplateContent(templateDetails, template.id, userId, transaction);
			await this.addOrUpdatedButtonsToTemplateContent(templateDetails, templateContent.id, userId, transaction);
			await this.addOrUpdateContentCards(templateDetails, templateContent.id, userId, transaction);
			await this.generateTemplate(templateDetails, template, transaction);

			await transaction.commit();
			return { id: template.id };
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	public async update(templateDetails: TemplateDto, templateId: number, userId: number) {
		const transaction = await this.sequelize.transaction();
		try {
			templateDetails.id = templateId;
			const template = await this.createOrUpdateTemplate(templateDetails, userId, transaction);
			const templateContent = await this.createOrUpdateTemplateContent(templateDetails, template.id, userId, transaction);
			await this.addOrUpdatedButtonsToTemplateContent(templateDetails, templateContent.id, userId, transaction);
			await this.addOrUpdateContentCards(templateDetails, templateContent.id, userId, transaction);
			await this.generateTemplate(templateDetails, template, transaction);

			await transaction.commit();
			return { id: template.id };
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	private async createOrUpdateTemplate(templateDetails: TemplateDto, userId: number, transaction: Transaction) {
		let template: TemplateModel;
		if (templateDetails.id) {
			template = await this.template.findOne({ where: { id: templateDetails.id }, transaction });
			if (!template) {
				throw new BadRequestException(TemplateMessage.templateNotFound);
			}
			const existingTemplate = await this.template.findOne({
				where: {
					name: templateDetails.name,
					id: { [Op.ne]: templateDetails.id },
				},
				transaction,
			});
			if (!template.providerTemplateId) {
				let providerTemplate;
				if (templateDetails?.templateType === TemplateType.ExternalTemplate) {
					const externalTemplateDetails = await TemplateGenerator.getExternalTemplate(templateDetails.name);
					providerTemplate = externalTemplateDetails.template_id;
				} else {
					const fynoTemplateDetails = await TemplateGenerator.getFynoTemplate(templateDetails.name);
					providerTemplate = fynoTemplateDetails.template_id;
				}
				await template.update({ providerTemplateId: providerTemplate }, { where: { id: templateDetails.id, isDeleted: false } });
			}

			if (existingTemplate) {
				throw new BadRequestException(TemplateMessage.templateAlreadyExists);
			}
		} else {
			const existingTemplate = await this.template.findOne({
				where: { name: templateDetails.name },
				transaction,
			});
			if (existingTemplate) {
				throw new BadRequestException(TemplateMessage.templateAlreadyExists);
			}
			template = new this.template();
		}
		if (templateDetails.description && templateDetails.description?.length > 250) {
			throw new BadRequestException(`The description exceeds the maximum allowed length of 250 characters.`);
		}

		if (templateDetails?.body?.length > 1032) {
			throw new BadRequestException('The body content exceeds the maximum allowed length of 1032 characters.');
		}
		if (templateDetails?.footer?.length > 60) {
			throw new BadRequestException('The footer content exceeds the maximum allowed length of 60 characters.');
		}

		Object.assign(template, {
			name: templateDetails.name,
			description: templateDetails.description,
			clientTemplateId: templateDetails.clientTemplateId,
			HSMUserId: templateDetails.HSMUserId,
			HSMPassword: templateDetails.HSMPassword,
			ISDCode: templateDetails.ISDCode,
			businessContactNumber: templateDetails.businessContactNumber,
			channel: templateDetails.channel,
			templateType: templateDetails.templateType,
			language: templateDetails.language,
			tenantId: templateDetails.tenantId,
			createdBy: userId,
		});

		await template.save({ transaction });
		return template;
	}

	private async createOrUpdateTemplateContent(templateDetails: TemplateDto, templateId: number, userId: number, transaction: Transaction) {
		let templateContent;

		if (templateDetails.id) {
			templateContent = await this.templateContent.findOne({
				where: { templateId: templateId, isDeleted: false },
				transaction,
			});

			if (!templateContent) {
				throw new Error('Template content not found');
			}

			templateContent.updatedBy = userId;
		} else {
			templateContent = new this.templateContent();
			templateContent.createdBy = userId;
		}
		if (templateDetails?.headerMediaType && templateDetails?.headerMediaType !== MediaType.Location) {
			if (!templateDetails.headerMediaUrl) {
				throw new BadRequestException('headerMediaUrl is required.');
			}
			if (!templateDetails.headerMediaSample) {
				throw new BadRequestException('headerMediaSample is required.');
			}
			if (!templateDetails.headerMediaHandle) {
				throw new BadRequestException('headerMediaHandle is required.');
			}
		}
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
			headerMediaHandle: templateDetails.headerMediaHandle,
			headerMediaSample: templateDetails.headerMediaSample,
			locationName: templateDetails.locationName,
			address: templateDetails.address,
			messageText: templateDetails.messageText,
			actionType: templateDetails.actionType || null,
			menuButtonName: templateDetails.menuButtonName || null,
			caption: templateDetails.caption,
			latitude: templateDetails.latitude,
			longitude: templateDetails.longitude,
			contentUrl: templateDetails.contentUrl,
			messageType: templateDetails.messageType,
			contentSubType: templateDetails.contentSubType,
			templateId: templateId,
		});

		await templateContent.save({ transaction });
		return templateContent;
	}

	private async addOrUpdatedButtonsToTemplateContent(
		templateDetails: TemplateDto,
		templateContentId: number,
		userId: number,
		transaction: Transaction,
	) {
		const buttonIds: number[] = [];
		let flowButtonCount = 0;
		let firstButtonType: string | null = null;

		// Helper function to process each button and assign it to a section if provided
		const processButton = async (buttonDetail: any, sectionId: number | null, index: number) => {
			let contentButton;

			if (buttonDetail.id) {
				contentButton = await this.templateContentButtons.findOne({ where: { id: buttonDetail.id }, transaction });
				if (!contentButton) {
					throw new BadRequestException(`Button not found at index ${index}.`);
				}
			} else {
				contentButton = new this.templateContentButtons();
			}

			if (buttonDetail.buttonDescription && buttonDetail.buttonDescription.length > 70) {
				throw new BadRequestException(`buttonDescription exceeds the maximum length of 70 characters at index ${index}.`);
			}
			// Validate button type
			if (firstButtonType === null) {
				firstButtonType = buttonDetail.buttonType;
			} else {
				if (firstButtonType === ButtonType.Flow && buttonDetail.buttonType !== ButtonType.Flow) {
					throw new BadRequestException(`Only one button with buttonType ${ButtonType.Flow} is allowed.`);
				}
				if (firstButtonType !== ButtonType.Flow && buttonDetail.buttonType === ButtonType.Flow) {
					throw new BadRequestException(`${ButtonType.Flow} button type is not allowed when the first button is not of type ${ButtonType.Flow}.`);
				}
			}

			if (buttonDetail.buttonType === ButtonType.Flow) {
				flowButtonCount++;
				if (flowButtonCount > 1) {
					throw new BadRequestException(`Only one button with buttonType ${ButtonType.Flow} is allowed.`);
				}
			}

			// Assign button properties and save
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

		if (templateDetails.buttons && templateDetails.buttons.length > 0) {
			const buttonsWithSections = templateDetails.buttons.filter(section => section.buttons);
			const buttonsWithoutSections = templateDetails.buttons.filter(button => !button.buttons);
			for (const section of buttonsWithSections) {
				let sectionRecord: any = null;

				// If sectionId is not provided, create a new section with the given sectionName or a default name
				if (!section.sectionId) {
					sectionRecord = new this.templateContentButtonsSection();
					sectionRecord.name = section.sectionName || 'New Section';
					await sectionRecord.save({ transaction });
					section.sectionId = sectionRecord.id; // Update the sectionId in request with the new section ID
				} else {
					// If sectionId is provided, find and update the section
					sectionRecord = await this.templateContentButtonsSection.findOne({ where: { id: section.sectionId }, transaction });
					if (sectionRecord) {
						sectionRecord.name = section.sectionName || sectionRecord.name;
						await sectionRecord.save({ transaction });
					} else {
						// Create a new section if sectionId does not exist
						sectionRecord = new this.templateContentButtonsSection();
						sectionRecord.id = section.sectionId;
						sectionRecord.name = section.sectionName || 'New Section';
						await sectionRecord.save({ transaction });
					}
				}

				if (Array.isArray(section?.buttons)) {
					for (const [index, buttonDetail] of section.buttons.entries()) {
						await processButton(buttonDetail, sectionRecord.id, index);
					}
				}
			}

			// Process buttons without sections
			for (const [index, buttonDetail] of buttonsWithoutSections.entries()) {
				await processButton(buttonDetail, null, index);
			}
		}

		// Update the template content with button IDs
		const templateContent = await this.templateContent.findOne({ where: { id: templateContentId }, transaction });
		templateContent.buttonIds = buttonIds;
		await templateContent.save({ transaction });
	}

	private async addOrUpdateContentCards(templateDetails: TemplateDto, templateContentId: number, userId: number, transaction: Transaction) {
		const existingContentCardsCount = await this.templateContentCards.count({
			where: { templateContentId },
			transaction,
		});

		const newContentCardsCount = templateDetails?.templateContentCards?.length || 0;
		if (existingContentCardsCount + newContentCardsCount > 10) {
			throw new BadRequestException('The total number of content cards exceeds the maximum allowed limit of 10.');
		}

		for (const card of templateDetails?.templateContentCards || []) {
			if (card.body?.length > 160) {
				throw new BadRequestException('The card body content exceeds the maximum allowed length of 160 characters.');
			}

			let contentCard: TemplateContentCardsModel;

			if (card.id) {
				contentCard = await this.templateContentCards.findOne({ where: { id: card.id }, transaction });
				if (!contentCard) {
					throw new BadRequestException(`Content card not found with id ${card.id}.`);
				}
			} else {
				contentCard = new this.templateContentCards();
			}

			Object.assign(contentCard, {
				mediaType: card.mediaType,
				contentUrl: card.contentUrl,
				mediaHandle: card.mediaHandle,
				mediaSample: card.mediaSample,
				body: card.body,
				bodyPlaceHolder: card.bodyPlaceHolder,
				templateContentId: templateContentId,
				createdBy: userId,
			});
			await contentCard.save({ transaction });

			await this.addOrUpdateButtonsToContentCard(card.buttons, contentCard.id, userId, transaction);
		}
	}

	private async addOrUpdateButtonsToContentCard(buttons: TemplateButtonDto[], contentCardId: number, userId: number, transaction: Transaction) {
		const cardButtonIds: number[] = [];

		for (const buttonDetail of buttons || []) {
			if (buttonDetail.title?.length > 25) {
				throw new BadRequestException('The card button title exceeds the maximum allowed length of 25 characters.');
			}
			if (buttonDetail.websiteUrl?.length > 2000) {
				throw new BadRequestException('The card button websiteUrl exceeds the maximum allowed length of 2000 characters.');
			}

			let cardButton;

			if (buttonDetail.id) {
				cardButton = await this.templateContentButtons.findOne({ where: { id: buttonDetail.id }, transaction });
				if (!cardButton) {
					throw new BadRequestException(`Button not found with id ${buttonDetail.id}.`);
				}
			} else {
				// Create new button
				cardButton = new this.templateContentButtons();
			}

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

	private async generateTemplate(templateDetails: TemplateDto, template: TemplateModel, transaction: Transaction) {
		let payload = {};

		if (templateDetails.templateType === TemplateType.ExternalTemplate) {
			payload = TemplateGenerator.externalTemplatePayload(templateDetails, template?.providerTemplateId);
			const response = await TemplateGenerator.createExternalTemplate(payload);
			await this.handleExternalTemplateResponse(response, transaction, template, templateDetails, payload as ExternalTemplatePayload);
		} else {
			payload = TemplateGenerator.fynoTemplatePayload(templateDetails, template?.providerTemplateId);
			const response = {};
			if (templateDetails.id) {
				await TemplateGenerator.updateFynoTemplate(payload, template.name);
			} else {
				await TemplateGenerator.createFynoTemplate(payload);
			}
			await this.handleFynoTemplateResponse(response, template, transaction);
		}

		return payload;
	}

	private async handleExternalTemplateResponse(
		response: any,
		transaction: Transaction,
		template: TemplateModel,
		templateDetails: TemplateDto,
		payload: ExternalTemplatePayload,
	) {
		let notificationPayload = {};
		if (response[0].status === TemplateStatus.ERROR) {
			template.status = response[0].status || TemplateStatus.ERROR;
			throw new BadRequestException(response[0]?._message?.error_user_msg || response[0]?._message?.message || 'Error saving template.');
		} else {
			if (!template?.id) {
				template.status = TemplateStatus[response[0]?.message?.status];
				template.providerTemplateId = response[0]?.message?.id;
			}
			if (template.status === TemplateStatus.APPROVED || template.status === TemplateStatus.PENDING) {
				const templateData = await this.template.findOne({ where: { id: template.id } });
				if (templateData?.notificationTemplateId) {
					notificationPayload = TemplateGenerator.externalNotificationPayload(
						template,
						payload as ExternalTemplatePayload,
						templateData.notificationTemplateId,
					);
					await TemplateGenerator.updateFynoTemplate(notificationPayload, template.name);
				} else {
					notificationPayload = TemplateGenerator.externalNotificationPayload(template, payload as ExternalTemplatePayload, null);
					const notificationDetail = await TemplateGenerator.createFynoTemplate(notificationPayload);
					template.notificationTemplateId = notificationDetail.event?.event_flow?.template;
				}
			}
		}
		await template.save({ transaction });
	}

	private async handleFynoTemplateResponse(response: any, template: TemplateModel, transaction: Transaction) {
		if (response.status === TemplateStatus.ERROR) {
			template.status = response.status;
			await template.save({ transaction });
			throw new BadRequestException(response?._message || 'Error saving template.');
		} else {
			template.status = TemplateStatus.APPROVED;
			await template.save({ transaction });
		}
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
				'channel',
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
							attributes: ['id', 'mediaType', 'contentUrl', 'body', 'bodyPlaceHolder', 'buttonIds', 'mediaSample', 'mediaHandle'],
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
						'contentUrl',
						'headerMediaHandle',
						'headerMediaSample',
						'headerMediaUrl',
						'messageText',
						'locationName',
					],
					required: false,
				},
			],
		});

		if (!template) {
			throw new BadRequestException(TemplateMessage.templateNotFound);
		}

		const allButtonIds = new Set<number>();

		// Collect button IDs from template content and cards
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
				'sectionId',
				'buttonDescription',
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
			map[section.id] = section;
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
									sectionId: sectionId === 'no_section' ? null : sectionId,
									sectionName: sectionId === 'no_section' ? null : sectionMap[sectionId]?.name,
									buttons: [],
								};
							}
							acc[sectionId].buttons.push(button);
							return acc;
						}, {});

					// Store buttons array directly if no section, otherwise keep section details
					content.dataValues.buttons = Object.values(groupedButtons)
						.map((group: any) => (group.sectionId ? group : group.buttons))
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
											sectionId: sectionId === 'no_section' ? null : sectionId,
											sectionName: sectionId === 'no_section' ? null : sectionMap[sectionId]?.name,
											buttons: [],
										};
									}
									acc[sectionId].buttons.push(button);
									return acc;
								}, {});

							// Store buttons array directly if no section, otherwise keep section details
							card.dataValues.buttons = Object.values(groupedButtons)
								.map((group: any) => (group.sectionId ? group : group.buttons))
								.flat();
						}
					}
				}
			}
		}

		// Merge templateContent with template data
		if (template?.dataValues.templateContent && template?.dataValues.templateContent.length > 0) {
			template.dataValues = {
				...template.dataValues,
				...template.dataValues.templateContent[0].dataValues,
			};
			delete template.dataValues.templateContent;
		}

		return template;
	}

	public async delete(templateId: number, userId: number) {
		const transaction = await this.sequelize.transaction();
		try {
			const template = await this.template.findOne({
				where: { id: templateId, isDeleted: false },
				transaction,
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
					transaction,
				},
			);

			const buttonIds = [];
			const updatedTemplateContent = await this.templateContent.findOne({
				where: { templateId, isDeleted: false },
				transaction,
			});

			if (updatedTemplateContent) {
				updatedTemplateContent.isDeleted = true;
				updatedTemplateContent.updatedBy = userId;
				await updatedTemplateContent.save({ transaction });
				buttonIds.push(...updatedTemplateContent.buttonIds);
			}

			const updatedTemplateContentCards = await this.templateContentCards.findAll({
				where: { templateContentId: updatedTemplateContent.id, isDeleted: false },
				attributes: ['buttonIds'],
				transaction,
			});

			const allButtonIds = updatedTemplateContentCards.flatMap(card => card.buttonIds);

			await this.templateContentCards.update(
				{ isDeleted: true, updatedBy: userId },
				{
					where: { templateContentId: updatedTemplateContent.id, isDeleted: false },
					transaction,
				},
			);

			buttonIds.push(...allButtonIds);

			await this.templateContentButtons.update(
				{ isDeleted: true, updatedBy: userId },
				{
					where: { id: buttonIds, isDeleted: false },
					transaction,
				},
			);
			let providerTemplateId: string;
			if (!template?.providerTemplateId) {
				if (template?.templateType === TemplateType.ExternalTemplate) {
					const externalTemplateDetails = await TemplateGenerator.getExternalTemplate(template.name);
					providerTemplateId = externalTemplateDetails?.template_id;
				} else {
					const fynoTemplateDetails = await TemplateGenerator.getFynoTemplate(template.name);
					providerTemplateId = fynoTemplateDetails?.template_id;
				}
			} else {
				providerTemplateId = template.providerTemplateId;
			}
			if (template?.templateType === TemplateType.ExternalTemplate) {
				if (providerTemplateId) {
					await TemplateGenerator.deleteExternalTemplate(template.name, providerTemplateId, template.language);
					if (template.status === TemplateStatus.APPROVED) {
						await TemplateGenerator.deleteFynoTemplate(template.name);
					}
				}
			} else {
				await TemplateGenerator.deleteFynoTemplate(template.name);
			}

			await transaction.commit();

			return { id: template.id };
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	private async mappingDynamicFilter(condition: object, dynamicFilter: FilterResponse[]) {
		for (const filter of dynamicFilter) {
			if (filter.filterKey === FilterKey.CreatedDate) {
				if (filter.minValue && filter.maxValue) {
					const parsedStartDate = parseISO(String(filter.minValue));
					const parsedEndDate = parseISO(String(filter.maxValue));
					condition['createdAt'] = {
						[Op.between]: [new Date(parsedStartDate), new Date(parsedEndDate)],
					};
				} else {
					throw new BadRequestException(AppMessages.InvalidFilterDate);
				}
			}
			if (filter.filterKey === FilterKey.Language && filter?.selectedValue) {
				condition['language'] = filter.selectedValue;
			}
			if (filter.filterKey === FilterKey.Channel && filter?.selectedValue) {
				condition['channel'] = filter.selectedValue;
			}
			if (filter.filterKey === FilterKey.TemplateStatus && filter?.selectedValue) {
				condition['status'] = filter.selectedValue;
			}
			if (filter.filterKey === FilterKey.CreatedBy && filter?.selectedValue) {
				condition['createdBy'] = filter.selectedValue;
			}
		}
		return condition;
	}

	public async all(pageModel: TemplateListRequestDto, tenantId: number) {
		const validSortFields = Object.keys(TemplateModel.rawAttributes).concat(['createdBy']);
		const sortField = validSortFields.includes(pageModel.sortField) ? pageModel.sortField : 'id';
		const sortOrder = Object.values(SortOrder).includes(pageModel.sortOrder as SortOrder) ? pageModel.sortOrder : SortOrder.ASC;
		const isPaginationEnabled = pageModel.page && pageModel.limit;
		let condition: WhereOptions = { isDeleted: false };

		if (!tenantId) {
			throw new BadRequestException(AppMessages.headerTenantId);
		}
		if (pageModel?.filter?.isArchive) {
			condition.isArchive = pageModel?.filter?.isArchive;
		}
		if (pageModel?.filter?.dynamicFilter && pageModel?.filter?.dynamicFilter?.length) {
			condition = { ...condition, ...(await this.mappingDynamicFilter(condition, pageModel.filter.dynamicFilter)) };
		}
		if (tenantId) {
			condition.tenantId = tenantId;
		}

		if (pageModel?.search) {
			condition = {
				...condition,
				[Op.or]: [
					{ name: { [Op.iLike]: `%${pageModel.search}%` } },
					{ '$Creator.firstName$': { [Op.iLike]: `%${pageModel.search}%` } },
					{ '$Creator.lastName$': { [Op.iLike]: `%${pageModel.search}%` } },
				],
			};
		}
		const templateResult = await this.template.findAndCountAll({
			where: condition,
			order: sortField === 'createdBy' ? [[{ model: this.users, as: 'Creator' }, 'firstName', sortOrder]] : [[sortField, sortOrder]],
			attributes: ['id', 'name', 'description', 'channel', 'language', 'status', 'createdAt', 'updatedAt'],
			include: [
				{
					association: new BelongsTo(this.users, this.template, { as: 'Creator', foreignKey: 'createdBy' }),
					attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
					required: false, // Keep it as a left join, so it doesn't exclude templates without a Creator
				},
				{
					association: new BelongsTo(this.users, this.template, { as: 'Updater', foreignKey: 'updatedBy' }),
					attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
					required: false, // Optional association, does not enforce the presence of Updater
				},
			],
			...(isPaginationEnabled && { limit: pageModel.limit, offset: (pageModel.page - 1) * pageModel.limit }), // Apply pagination if enabled
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
	public async unArchive(templateIds: TemplateActionDto, userId: number) {
		const templateToUnArchive = await this.template.findAll({
			where: {
				id: {
					[Op.in]: templateIds,
				},
				isDeleted: false,
			},
		});
		if (!templateToUnArchive.length) {
			throw new BadRequestException(TemplateMessage.notFoundUnArchiveTemplate);
		}
		for (const template of templateToUnArchive) {
			template.isArchive = false;
			template.updatedBy = userId;
			await template.save();
		}
		return templateToUnArchive.map(template => ({ id: template.id }));
	}
	public async archive(templateIds: TemplateActionDto, userId: number) {
		const templateToArchive = await this.template.findAll({
			where: {
				id: {
					[Op.in]: templateIds,
				},
				isDeleted: false,
			},
		});
		console.log('templateToArchive', templateToArchive);
		if (!templateToArchive.length) {
			throw new BadRequestException(TemplateMessage.notFoundArchiveTemplate);
		}
		for (const template of templateToArchive) {
			template.isArchive = true;
			template.updatedBy = userId;
			await template.save();
		}
		console.log('templateToArchive', templateToArchive);
		return templateToArchive.map(template => ({ id: template.id }));
	}
}
