import { BadRequestException } from '@/exceptions/BadRequestException';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { assessmentMessage, ContentMessage } from '@/utils/helpers/app-message.helper';
import DB from '@databases';
// import { Op } from 'sequelize';
import { assessmentDto } from '@/models/dtos/assessment.dto';
import { BelongsTo } from 'sequelize';

class AssessmentServices {
	private assessmentMaster = DB.AssessmentMaster;
	private content = DB.Content;
	private users = DB.Users;
	constructor() {}
	public async add(assessmentData: assessmentDto, createdUser: JwtTokenData) {
		const content = await this.content.findOne({
			where: {
				id: assessmentData.contentId,
				isDeleted: false,
			},
		});
		if (!content) {
			throw new BadRequestException(ContentMessage.contentNotFound);
		}

		let assessment = new this.assessmentMaster();
		assessment.name = assessmentData.name;
		assessment.contentId = assessmentData.contentId;
		assessment.description = assessmentData.description;
		assessment.pass = assessmentData.pass;
		assessment.createdBy = createdUser.id;
		assessment.scoring = assessmentData.scoring;
		assessment.timed = assessmentData.timed;
		assessment.totalQuestion = assessmentData.totalQuestion;
		assessment = await assessment.save();
		return { id: assessment.id };
	}
	public async update(assessmentData: assessmentDto, assessmentId: number, updatedUser: JwtTokenData) {
		const content = await this.content.findOne({
			where: {
				id: assessmentData.contentId,
				isDeleted: false,
			},
		});
		if (!content) {
			throw new BadRequestException(ContentMessage.contentNotFound);
		}

		const assessment = await this.assessmentMaster.findOne({
			where: {
				id: assessmentId,
				isDeleted: false,
			},
		});
		if (!assessment) {
			throw new BadRequestException(assessmentMessage.assessmentNotFound);
		}

		assessment.name = assessmentData.name;
		assessment.contentId = assessmentData.contentId;
		assessment.description = assessmentData.description;
		assessment.pass = assessmentData.pass;
		assessment.updatedBy = updatedUser.id;
		assessment.scoring = assessmentData.scoring;
		assessment.timed = assessmentData.timed;
		assessment.totalQuestion = assessmentData.totalQuestion;
		await assessment.save();

		return { id: assessment.id };
	}
	public async one(assessmentId: number) {
		const assessment = await this.assessmentMaster.findOne({
			where: { id: assessmentId, isDeleted: false },
			attributes: ['name', 'description', 'totalQuestion', 'scoring'],
			include: [
				{
					association: new BelongsTo(this.assessmentMaster, this.content, { as: 'content', foreignKey: 'contentId' }),
					attributes: ['name', 'description', 'type'],
				},
				{
					association: new BelongsTo(this.users, this.assessmentMaster, { as: 'Creator', foreignKey: 'createdBy' }),
					attributes: ['firstName', 'lastName'],
				},
				{
					association: new BelongsTo(this.users, this.assessmentMaster, { as: 'Updater', foreignKey: 'updatedBy' }),
					attributes: ['firstName', 'lastName'],
				},
			],
		});

		if (!assessment) {
			throw new BadRequestException(assessmentMessage.assessmentNotFound);
		}
		return assessment;
	}
	// public async delete(variableId: number, userId: number) {
	// 	const variable = await this.variableMaster.findOne({
	// 		where: {
	// 			id: variableId,
	// 			isDeleted: false,
	// 		},
	// 	});
	// 	if (!variable) {
	// 		throw new BadRequestException(VariableMessage.variableNotFound);
	// 	}
	// 	if (variable.category === VariableCategories.Standard) {
	// 		throw new BadRequestException(VariableMessage.NotDeleteStandard);
	// 	}

	// 	variable.isDeleted = true;
	// 	variable.updatedBy = userId;

	// 	await variable.save();
	// 	return { id: variable.id };
	// }
	// public async all(pageModel: variableListDto, tenantId: number) {
	// 	const page = pageModel.page || 1,
	// 		limit = pageModel.pageSize || 10,
	// 		orderByField = pageModel.sortField || 'id',
	// 		sortDirection = pageModel.sortOrder || 'ASC';
	// 	const offset = (page - 1) * limit;
	// 	let condition = {};
	// 	if (tenantId) {
	// 		condition = {
	// 			[Op.or]: [{ tenantId: tenantId }, { tenantId: null }],
	// 		};
	// 	}
	// 	if (pageModel?.search) {
	// 		condition = {
	// 			...condition,
	// 			name: { [Op.iLike]: `%${pageModel.search}%` },
	// 		};
	// 	}
	// 	if (pageModel?.filter?.category) {
	// 		condition = {
	// 			...condition,
	// 			category: pageModel.filter.category,
	// 		};
	// 	}
	// 	const validateList = await this.variableMaster.findAndCountAll({
	// 		where: { isDeleted: false, ...condition },
	// 		offset,
	// 		limit,
	// 		attributes: ['id', 'name', 'isMandatory', 'type', 'description', 'category', 'options', 'tenantId'],
	// 		order: [[orderByField, sortDirection]],
	// 	});
	// 	return validateList;
	// }
	// public async getVariableDetails(userId: number, tenantId: number) {
	// 	const user = await this.users.findOne({
	// 		where: {
	// 			id: userId,
	// 			isDeleted: false,
	// 		},
	// 	});
	// 	if (!user) {
	// 		throw new BadRequestException(AppMessages.userNotFound);
	// 	}

	// 	const responseList = VariableHelper.findTenantVariableDetails(userId, tenantId);
	// 	return responseList;
	// }
}

export default AssessmentServices;
