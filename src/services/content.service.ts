import { AWS_S3_FILE_URL } from '@/config';
import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { ContentActionDto, ContentDto } from '@/models/dtos/content.dto';
import { FileDestination } from '@/models/enums/file-destination.enum';
import { AppMessages, assessmentMessage, ContentMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import { FileHelper } from '@/utils/helpers/file.helper';
import S3Services from '@/utils/services/s3.services';
import { isValid, parse } from 'date-fns';
import { BelongsTo, HasMany, Op, WhereOptions } from 'sequelize';
import UserService from './user.service';
import { ContentStatus, ConteTypes } from '@/models/enums/contentType.enum';
import { ScoringType } from '@/models/enums/assessment.enum';
import { ContentModel } from '@/models/db/content.model';
import { SortOrder } from '@/models/enums/sort-order.enum';
import { FilterResponse } from '@/models/interfaces/filter.interface';
import { FilterKey } from '@/models/enums/filter.enum';
import { parseISO } from 'date-fns';
import { ContentListRequestDto } from '@/models/dtos/list-request.dto';

export class ContentService {
	private content = DB.Content;
	private user = DB.Users;
	private tenant = DB.Tenant;
	private assessmentMaster = DB.AssessmentMaster;
	private assessmentQuestionMatrix = DB.AssessmentQuestionMatrix;
	private assessmentOption = DB.AssessmentOption;
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

	public async add(contentDetails: ContentDto, userId: number) {
		const tenant = await this.tenant.findOne({
			where: {
				id: contentDetails.tenantId,
				isDeleted: false,
			},
		});
		if (!tenant) {
			throw new BadRequestException(TenantMessage.tenantNotFound);
		}

		if (contentDetails.type == ConteTypes.Assessment) {
			const requiredAssessmentFields = ['name', 'description', 'type', 'timed', 'scoring', 'timeType'];
			for (const element of requiredAssessmentFields) {
				if (!(element in contentDetails)) {
					throw new BadRequestException(`${element} ${AppMessages.isRequired}`);
				}
			}
			if (contentDetails.scoring == ScoringType.PerQuestion) {
				if (!contentDetails.pass) {
					throw new BadRequestException(assessmentMessage.passIsMissing);
				}
			}
			if (contentDetails.scoring == ScoringType.MaxScore) {
				if (!contentDetails.score) {
					throw new BadRequestException(assessmentMessage.scoreIsRequiredInMaxScoreTypeQuestion);
				}
				if (!contentDetails.pass) {
					throw new BadRequestException(assessmentMessage.passIsMissing);
				}
			}

			/** first create assessment on assessmentMaster table */
			let assessment = new this.assessmentMaster();
			assessment.name = contentDetails.name;
			assessment.description = contentDetails.description;
			assessment.scoring = contentDetails.scoring;
			assessment.timed = contentDetails.timed;
			assessment.pass = contentDetails.pass;
			assessment.score = contentDetails.score;
			assessment.timeType = contentDetails.timeType;
			assessment.createdBy = userId;
			assessment = await assessment.save();

			/** after create assessment create a content in content table */
			let assessmentContent = new this.content();
			assessmentContent.name = contentDetails.name;
			assessmentContent.type = contentDetails.type;
			assessmentContent.description = contentDetails.description;
			assessmentContent.tenantId = contentDetails.tenantId;
			assessmentContent.assessmentId = assessment.id;
			assessmentContent.createdBy = userId;
			assessmentContent.isPublish = contentDetails.isPublish;
			assessmentContent.isArchive = contentDetails.isArchive;
			assessmentContent = await assessmentContent.save();

			return { id: assessmentContent.id };
		}

		let content = new this.content();
		content.name = contentDetails.name;
		content.type = contentDetails.type;
		content.description = contentDetails.description;
		content.tenantId = contentDetails.tenantId;
		content.uploadedFileIds = contentDetails.uploadedFileIds;
		content.isPublish = contentDetails.isPublish;
		content.isArchive = contentDetails.isArchive;
		content.createdBy = userId;
		content = await content.save();
		if (content.uploadedFileIds) {
			await this.moveFiles(contentDetails.uploadedFileIds, content.tenantId, content.id);
		}
		return { id: content.id };
	}

	public async update(contentDetails: ContentDto, contentId: number, userId: number) {
		let content = await this.content.findOne({
			where: { isDeleted: false, id: contentId },
		});

		if (!content) {
			throw new BadRequestException(ContentMessage.contentNotFound);
		}

		if (content.type == ConteTypes.Assessment) {
			let assessment = await this.assessmentMaster.findOne({
				where: {
					id: content.assessmentId,
					isDeleted: false,
				},
			});
			if (!assessment) {
				throw new BadRequestException(assessmentMessage.assessmentNotFound);
			}

			assessment.name = contentDetails.name;
			assessment.description = contentDetails.description;
			assessment.scoring = contentDetails.scoring;
			assessment.timed = contentDetails.timed;
			assessment.pass = contentDetails.pass;
			assessment.score = contentDetails.score;
			assessment.timeType = contentDetails.timeType;
			assessment.createdBy = userId;
			assessment = await assessment.save();

			/** after update assessment create a content in content table */
			content.name = contentDetails.name;
			content.type = contentDetails.type;
			content.description = contentDetails.description;
			content.tenantId = contentDetails.tenantId;
			content.assessmentId = assessment.id;
			content.createdBy = userId;
			content.isPublish = contentDetails.isPublish;
			content.isArchive = contentDetails.isArchive;
			content = await content.save();

			return { id: content.id };
		}

		content.name = contentDetails.name;
		content.type = contentDetails.type;
		content.description = contentDetails.description;
		content.tenantId = contentDetails.tenantId;
		content.uploadedFileIds = contentDetails.uploadedFileIds;
		content.isPublish = contentDetails.isPublish;
		content.isArchive = contentDetails.isArchive;
		content.updatedBy = userId;

		await content.save();
		return content.id;
	}

	// Get Content Details By contentId
	public async one(contentId: number) {
		const content = await this.content.findOne({
			where: { id: contentId, isDeleted: false },
			include: [
				{
					association: new BelongsTo(this.user, this.content, { as: 'Creator', foreignKey: 'createdBy' }),
					attributes: ['id', 'firstName', 'lastName'],
				},
				{
					association: new BelongsTo(this.user, this.content, { as: 'Updater', foreignKey: 'updatedBy' }),
					attributes: ['id', 'firstName', 'lastName'],
				},
				{
					association: new BelongsTo(this.content, this.assessmentMaster, { as: 'assessment', foreignKey: 'assessmentId' }),
					attributes: ['id', 'totalQuestion', 'scoring', 'timed', 'pass', 'score', 'timeType'],
					include: [
						{
							association: new HasMany(this.assessmentMaster, this.assessmentQuestionMatrix, { as: 'question', foreignKey: 'assessmentId' }),
							where: { isDeleted: false },
							required: false,
							attributes: ['id', 'question', 'type', 'score'],
							include: [
								{
									association: new HasMany(this.assessmentQuestionMatrix, this.assessmentOption, { as: 'options', foreignKey: 'questionId' }),
									where: { isDeleted: false },
									required: false,
									attributes: ['id', 'option', 'isCorrectAnswer'],
								},
							],
						},
					],
				},
			],
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
		const returnObj = {
			name: content.name,
			type: content.type,
			description: content.description,
			tenantId: content.tenantId,
			uploadedFiles: uploadedFiles,
			uploadedFilesIds: content.uploadedFileIds,
		};
		if (content.type == ConteTypes.Assessment) {
			returnObj['assessment'] = content['assessment'];
		}
		return returnObj;
	}

	private async mappingDynamicFilter(condition: object, dynamicFilter: FilterResponse[]) {
		for (const filter of dynamicFilter) {
			if (filter.filterKey === FilterKey.CreatedDate) {
				const parsedStartDate = parseISO(String(filter.minValue));
				const parsedEndDate = parseISO(String(filter.maxValue));
				condition['createdAt'] = {
					[Op.between]: [new Date(parsedStartDate), new Date(parsedEndDate)],
				};
			}
			if (filter.filterKey === FilterKey.UpdateDate) {
				const parsedStartDate = parseISO(String(filter.minValue));
				const parsedEndDate = parseISO(String(filter.maxValue));
				condition['updatedAt'] = {
					[Op.between]: [new Date(parsedStartDate), new Date(parsedEndDate)],
				};
			}
			if (filter.filterKey === FilterKey.MediaType && filter?.selectedValue) {
				condition['type'] = filter.selectedValue;
			}
			if (filter.filterKey === FilterKey.ContentStatus && filter?.selectedValue) {
				condition['isPublish'] = filter.selectedValue == ContentStatus.Published ? true : false;
			}
		}
	}

	public async all(pageModel: ContentListRequestDto, tenantId: number) {
		const { page = 1, limit } = pageModel;
		const validSortFields = Object.keys(ContentModel.rawAttributes);
		const sortField = validSortFields.includes(pageModel.sortField) ? pageModel.sortField : 'id';
		const sortOrder = Object.values(SortOrder).includes(pageModel.sortOrder as SortOrder) ? pageModel.sortOrder : SortOrder.ASC;
		const offset = (page - 1) * (limit || 0);
		if (!tenantId) {
			throw new BadRequestException(AppMessages.headerTenantId);
		}
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
			if (pageModel?.filter?.dynamicFilter && pageModel?.filter?.dynamicFilter?.length) {
				await this.mappingDynamicFilter(condition, pageModel.filter.dynamicFilter);
			}
			if (pageModel?.filter?.isArchive == true || pageModel?.filter?.isArchive == false) {
				condition['isArchive'] = pageModel.filter.isArchive;
			}
		}
		const contentResult = await this.content.findAndCountAll({
			where: condition,
			offset,
			limit: limit,
			order: [[sortField, sortOrder]],
			attributes: ['id', 'name', 'createdAt', 'tenantId', 'type', 'description', 'updatedAt', 'uploadedFileIds'],
			include: [
				// {
				// 	model: this.user,
				// 	as: 'Creator', // Use the correct alias
				// 	attributes: ['id', 'firstName', 'lastName'],
				// 	where: {
				// 		firstName: { [Op.iLike]: `%${pageModel.search}%` }, // Search by creator's first name
				// 	},
				// 	required: false, // Use required: true if you only want contents with a matching creator
				// },
				{
					association: new BelongsTo(this.user, this.content, { as: 'Creator', foreignKey: 'createdBy' }),
					attributes: ['id', 'firstName', 'lastName'],
				},
				{
					association: new BelongsTo(this.user, this.content, { as: 'Updater', foreignKey: 'updatedBy' }),
					attributes: ['id', 'firstName', 'lastName'],
				},
				{
					association: new BelongsTo(this.content, this.assessmentMaster, { as: 'assessment', foreignKey: 'assessmentId' }),
					attributes: ['id', 'totalQuestion', 'scoring', 'timed', 'pass', 'score', 'timeType'],
					include: [
						{
							association: new HasMany(this.assessmentMaster, this.assessmentQuestionMatrix, { as: 'question', foreignKey: 'assessmentId' }),
							where: { isDeleted: false },
							required: false,
							attributes: ['id', 'question', 'type', 'score'],
							include: [
								{
									association: new HasMany(this.assessmentQuestionMatrix, this.assessmentOption, { as: 'options', foreignKey: 'questionId' }),
									where: { isDeleted: false },
									required: false,
									attributes: ['id', 'option', 'isCorrectAnswer'],
								},
							],
						},
					],
				},
			],
			distinct: true,
		});
		for (let i = 0; i < contentResult.rows.length; i++) {
			const uploadedFiles = [];
			const content = contentResult.rows[i];
			if (content.uploadedFileIds && content.uploadedFileIds.length) {
				const allFiles = await this.findAllFile(content.uploadedFileIds);
				if (allFiles.length) {
					const filePromises = allFiles.map(async file => {
						const fileUrl = FileHelper.getContentUrl(content.tenantId, content.id, file.name);
						return fileUrl;
					});
					uploadedFiles.push(...(await Promise.all(filePromises)));
					content['uploadedFileIds'] = uploadedFiles;
				}
			}
		}

		return contentResult;
	}

	public async remove(contentId: number, userId: number) {
		const content = await this.content.findOne({
			where: { isDeleted: false, id: contentId },
		});

		if (!content) {
			throw new BadRequestException(ContentMessage.contentNotFound);
		}

		if (content.type == ConteTypes.Assessment) {
			const assessment = await this.assessmentMaster.findOne({
				where: {
					id: content.assessmentId,
					isDeleted: false,
				},
			});
			if (!assessment) {
				throw new BadRequestException(assessmentMessage.assessmentNotFound);
			}

			await this.assessmentQuestionMatrix.update(
				{
					isDeleted: true,
					updatedBy: userId,
				},
				{
					where: {
						assessmentId: assessment.id,
					},
				},
			);

			assessment.set({
				isDeleted: true,
				updatedBy: userId,
			});
		}
		content.set({
			isDeleted: true,
			updatedBy: userId,
		});

		await content.save();
		return content.id;
	}
	public async changeArchiveStatus(contentId: ContentActionDto, userId: number) {
		const contents = await this.content.findAll({
			where: {
				id: {
					[Op.in]: contentId,
				},
				isDeleted: false,
			},
		});

		if (!contents.length) {
			throw new BadRequestException(ContentMessage.notFoundArchiveContent);
		}

		for (const content of contents) {
			content.isArchive = true;
			content.updatedBy = userId;
			await content.save();
		}

		return contents.map(content => ({ id: content.id }));
	}
	public async unArchiveContent(contentId: ContentActionDto, userId: number) {
		const contents = await this.content.findAll({
			where: {
				id: {
					[Op.in]: contentId,
				},
				isDeleted: false,
			},
		});

		if (!contents.length) {
			throw new BadRequestException(ContentMessage.notFoundUnArchiveContent);
		}

		for (const content of contents) {
			content.isArchive = false;
			content.updatedBy = userId;
			await content.save();
		}

		return contents.map(content => ({ id: content.id }));
	}

	public async publishContent(contentId: ContentActionDto, userId: number) {
		const contents = await this.content.findAll({
			where: {
				id: {
					[Op.in]: contentId,
				},
				isDeleted: false,
			},
		});

		if (!contents.length) {
			throw new BadRequestException(ContentMessage.notFoundUnArchiveContent);
		}

		for (const content of contents) {
			content.isPublish = true;
			content.updatedBy = userId;
			await content.save();
		}

		return contents.map(content => ({ id: content.id }));
	}
}
