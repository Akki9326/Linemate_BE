import { AWS_S3_FILE_URL } from '@/config';
import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { ContentListDto } from '@/models/dtos/content-list.dto';
import { ContentDto } from '@/models/dtos/content.dto';
import { FileDestination } from '@/models/enums/file-destination.enum';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { ContentMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import { FileHelper } from '@/utils/helpers/file.helper';
import S3Services from '@/utils/services/s3.services';
import { isValid, parse } from 'date-fns';
import { Op, WhereOptions } from 'sequelize';
import UserService from './user.service';

export class ContentService {
	private content = DB.Content;
	private user = DB.Users;
	private tenant = DB.Tenant;
	private uploadedFile = DB.UploadedFile;
	public s3Service = new S3Services();
	public userService = new UserService();

	constructor() {}
	private async findAllFile(fileIds: number[]) {
		return await this.uploadedFile.findAll({
			where: {
				id: {
					[Op.in]: fileIds,
				},
			},
		});
	}
	private async moveFiles(fileIds: number[], tenantId: number, contentId: number) {
		const fileDestination = `tenants/${tenantId}/contents/${contentId}`;
		const allFile = await this.findAllFile(fileIds);
		if (fileDestination?.length) {
			await Promise.all(
				allFile.map(async file => {
					const fileUrl = `${AWS_S3_FILE_URL}/${FileDestination.ContentTemp}/${file.name}`;
					await this.s3Service.moveFileByUrl(fileUrl, fileDestination);
				}),
			);
		}
	}
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
		if (content.uploadedFileIds) {
			await this.moveFiles(contentDetails.uploadedFileIds, content.tenantId, content.id);
		}
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

	// Get Content Details By contentId
	public async one(contentId: number) {
		const content = await this.content.findOne({
			where: { id: contentId, isDeleted: false },
		});

		if (!content) {
			throw new BadRequestException(ContentMessage.contentNotFound);
		}

		const uploadedFiles = [];
		if (content.uploadedFileIds.length) {
			const allFiles = await this.findAllFile(content.uploadedFileIds);
			if (allFiles.length) {
				const filePromises = allFiles.map(async file => {
					const fileUrl = FileHelper.getContentUrl(content.tenantId, content.id, file.name);
					return fileUrl;
				});
				uploadedFiles.push(...(await Promise.all(filePromises)));
			}
		}

		return {
			name: content.name,
			type: content.type,
			description: content.description,
			tenantId: content.tenantId,
			uploadedFiles: uploadedFiles,
		};
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

		// TODO: After change createdBy and updatedBy Integer make join with user table
		const createdByIds = contentResult.rows.map(content => content.createdBy);
		const updatedByIds = contentResult.rows.map(content => content.updatedBy);
		const userIds = [...new Set([...createdByIds, ...updatedByIds])];

		const users = await this.user.findAll({
			where: {
				id: userIds,
			},
			attributes: ['id', 'firstName', 'lastName'],
		});

		const userMap = users.reduce((acc, user) => {
			acc[user.id] = user;
			return acc;
		}, {});

		const combinedResult = contentResult.rows.map(content => {
			const createdByUser = userMap[content.createdBy];
			const updatedByUser = userMap[content.updatedBy];
			return {
				...content.toJSON(),
				createdBy: createdByUser ? { firstName: createdByUser.firstName, lastName: createdByUser.lastName } : null,
				updatedBy: updatedByUser ? { firstName: updatedByUser.firstName, lastName: updatedByUser.lastName } : null,
			};
		});

		return {
			count: contentResult.count,
			rows: combinedResult,
		};
	}

	public async remove(contentId: number, user: JwtTokenData) {
		const content = await this.content.findOne({
			where: { isDeleted: false, id: contentId },
		});

		if (!content) {
			throw new BadRequestException(ContentMessage.contentNotFound);
		}

		content.set({
			isDeleted: true,
			updatedBy: user.id.toString(),
		});

		await content.save();
		return content.id;
	}
}
