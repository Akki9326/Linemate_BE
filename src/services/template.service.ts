import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { TemplateDto } from '@/models/dtos/template-dto';
import { TemplateListRequestDto } from '@/models/dtos/template-list.dto';
import { AppMessages, TemplateMessage } from '@/utils/helpers/app-message.helper';
import { Op } from 'sequelize';
import { BelongsTo, WhereOptions } from 'sequelize';

export class TemplateService {
	public users = DB.Users;
	public template = DB.Template;
	public templateContent = DB.TemplateContent;
	public templateContentButtons = DB.TemplateContentButtons;

	constructor() {}
	public async add(templateDetails: TemplateDto, userId: number) {
		const template = new this.template();
		template.name = templateDetails.name;
		template.description = templateDetails.description;
		template.clientTemplateId = templateDetails.clientTemplateId;
		template.HSMUserId = templateDetails.HSMUserId;
		template.HSMPassword = templateDetails.HSMPassword;
		template.ISDCode = templateDetails.ISDCode;
		template.businessContactNumber = templateDetails.businessNumber;
		template.channel = templateDetails.channel;
		template.templateType = templateDetails.templateType;
		template.language = templateDetails.language;
		template.tenantId = templateDetails.tenantId;
		template.createdBy = userId;
		await template.save();

		const templateContent = new this.templateContent();
		templateContent.headerType = templateDetails.headerType;
		templateContent.headerMediaType = templateDetails.headerMediaType;
		templateContent.headerContent = templateDetails.headerContent;
		templateContent.headerPlaceHolder = templateDetails.headerPlaceHolder;
		templateContent.body = templateDetails.body;
		templateContent.bodyPlaceHolder = templateDetails.bodyPlaceHolder;
		templateContent.footer = templateDetails.footer;
		templateContent.contentUrl = templateDetails.contentUrl;
		templateContent.contentType = templateDetails.contentType;
		templateContent.caption = templateDetails.caption;
		templateContent.latitude = templateDetails.latitude;
		templateContent.longitude = templateDetails.longitude;
		templateContent.address = templateDetails.address;
		templateContent.isPreviewUrl = templateDetails.isPreviewUrl;
		templateContent.isTrackUrl = templateDetails.isTrackURL;
		templateContent.messageType = templateDetails.messageType;
		templateContent.additionalData = templateDetails.additionalData;
		templateContent.contentSubType = templateDetails.contentSubType;
		templateContent.contentSubType = templateDetails.contentSubType;
		templateContent.templateId = template.id;
		templateContent.createdBy = userId;
		await templateContent.save();

		const buttonIds = [];
		for (const buttonDetail of templateDetails.buttons) {
			const contentButton = new this.templateContentButtons();
			contentButton.buttonType = buttonDetail.buttonType || null;
			contentButton.actionType = buttonDetail.actionType || null;
			contentButton.title = buttonDetail.title;
			contentButton.websiteUrl = buttonDetail.websiteUrl;
			contentButton.isDynamicUrl = buttonDetail.isDynamicUrl;
			contentButton.navigateScreen = buttonDetail.navigateScreen;
			contentButton.initialScreen = buttonDetail.initialScreen;
			contentButton.flowId = buttonDetail.flowId;
			contentButton.flowAction = buttonDetail.flowAction;
			contentButton.flowToken = buttonDetail.flowToken;
			contentButton.createdBy = userId;
			await contentButton.save();
			buttonIds.push(contentButton.id);
		}
		templateContent.buttonIds = buttonIds;
		await templateContent.save();

		return { id: template.id };
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
			],
			include: [
				{
					model: this.templateContent,
					as: 'templateContent',
					where: { isDeleted: false },
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
						'isTrackUrl',
						'messageType',
						'buttonIds',
						'contentSubType',
						'additionalData',
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

		if (template?.dataValues.templateContent && template?.dataValues.templateContent.length > 0) {
			for (const content of template?.dataValues.templateContent || []) {
				if (content.buttonIds && content.buttonIds.length > 0) {
					const buttons = await this.templateContentButtons.findAll({
						where: {
							id: content.buttonIds,
							isDeleted: false,
						},
						attributes: [
							'title',
							'buttonType',
							'actionType',
							'websiteUrl',
							'isDynamicUrl',
							'navigateScreen',
							'initialScreen',
							'flowId',
							'flowAction',
							'flowToken',
						],
					});
					content.dataValues.buttons = buttons;
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
}
