import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { ContentListDto } from '@/models/dtos/content-list.dto';
import { ContentDto } from '@/models/dtos/content.dto';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { ContentMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import { Op, WhereOptions } from 'sequelize';
import { parse, isValid } from 'date-fns';

export class ContentService {
	private content = DB.Content;
	private user = DB.Users;
	private tenant = DB.Tenant;

	constructor() {}
	private async setDateRangeCondition(field: string, startDateStr: string, endDateStr: string, condition: object) {
		const startDate = parse(startDateStr, 'yyyy-MM-dd', new Date());
		const endDate = parse(endDateStr, 'yyyy-MM-dd', new Date());
		if (isValid(startDate) && isValid(endDate)) {
			condition[field] = {
				[Op.between]: [startDate, endDate],
			};
		} else {
			console.error('Invalid date range:', startDateStr, endDateStr);
		}
	}

	public async add(contentDetails: ContentDto, user: JwtTokenData) {
		const tenant = await this.tenant.findOne({
			where: {
				id: contentDetails.tenantId,
				isDeleted: false,
			},
		});
		if (!tenant) {
			throw new BadRequestException(TenantMessage.tenantNotFound);
		}
		let content = new this.content();
		content.name = contentDetails.name;
		content.type = contentDetails.type;
		content.description = contentDetails.description;
		content.tenantId = contentDetails.tenantId;
		content.uploadedFileIds = contentDetails.uploadedFileIds;
		content.isPublish = contentDetails.isPublish;
		content.isArchive = contentDetails.isArchive;
		content.createdBy = user.id.toString();
		content = await content.save();
		return { id: content.id };
	}

	public async update(contentDetails: ContentDto, contentId: number, user: JwtTokenData) {
		const content = await this.content.findOne({
			where: { isDeleted: false, id: contentId },
		});

		if (!content) {
			throw new BadRequestException(ContentMessage.contentNotFound);
		}
		content.name = contentDetails.name;
		content.type = contentDetails.type;
		content.description = contentDetails.description;
		content.tenantId = contentDetails.tenantId;
		content.uploadedFileIds = contentDetails.uploadedFileIds;
		content.isPublish = contentDetails.isPublish;
		content.isArchive = contentDetails.isArchive;
		content.updatedBy = user.id.toString();

		await content.save();
		return content.id;
	}

	public async one(contentId: number) {
		const content = await this.content.findOne({
			where: { id: contentId, isDeleted: false },
		});

		if (!content) {
			throw new BadRequestException(ContentMessage.contentNotFound);
		}

		return {
			name: content.name,
			type: content.type,
			description: content.description,
			tenantId: content.tenantId,
			uploadedFileIds: content.uploadedFileIds,
		};
	}
	async fetchUserDetails(userId: number) {
		const user = await this.user.findByPk(userId, {
			attributes: ['id', 'firstName', 'lastName'],
		});
		return user;
	}

	public async all(pageModel: ContentListDto, tenantId: number) {
		const { page = 1, pageSize = 10, sortField = 'id', sortOrder = 'ASC' } = pageModel;
		const offset = (page - 1) * pageSize;
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

		if (pageModel.filter) {
			if (pageModel.filter?.archive !== undefined && pageModel.filter?.archive !== null) {
				condition['isArchive'] = pageModel.filter.archive;
			}
			if (pageModel.filter?.isPublish !== undefined && pageModel.filter?.isPublish !== null) {
				condition['isPublish'] = pageModel.filter.isPublish;
			}

			if (pageModel.filter.createdBetween) {
				const { startDate, endDate } = pageModel.filter.createdBetween;
				if (startDate && endDate) {
					this.setDateRangeCondition('createdAt', startDate, endDate, condition);
				}
			}

			if (pageModel.filter.updatedBetween) {
				const { startDate, endDate } = pageModel.filter.updatedBetween;
				if (startDate && endDate) {
					this.setDateRangeCondition('updatedAt', startDate, endDate, condition);
				}
			}
		}
		const contentResult = await this.content.findAndCountAll({
			where: condition,
			offset,
			limit: pageSize,
			order: [[sortField, sortOrder]],
			attributes: ['id', 'name', 'createdAt', 'tenantId', 'createdBy', 'updatedBy'],
		});

		const contentWithCreator = await Promise.all(
			contentResult.rows.map(async role => {
				let createdBy = null;
				let updatedBy = null;

				if (role.createdBy && !isNaN(parseInt(role.createdBy))) {
					createdBy = await this.fetchUserDetails(parseInt(role.createdBy));
				}

				if (role.updatedBy && !isNaN(parseInt(role.updatedBy))) {
					updatedBy = await this.fetchUserDetails(parseInt(role.updatedBy));
				}

				return { ...role.toJSON(), createdBy, updatedBy };
			}),
		);

		return {
			count: contentResult.count,
			rows: contentWithCreator,
		};
	}

	public async remove(contentId: number) {
		const content = await this.content.findOne({
			where: { isDeleted: false, id: contentId },
		});

		if (!content) {
			throw new BadRequestException(ContentMessage.contentNotFound);
		}

		content.set({
			isDeleted: true,
		});

		await content.save();
		return content.id;
	}
}
