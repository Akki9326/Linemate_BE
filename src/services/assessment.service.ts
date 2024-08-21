import { BadRequestException } from '@/exceptions/BadRequestException';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { assessmentMessage, ContentMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import DB from '@databases';
import { assessmentDto, questionData } from '@/models/dtos/assessment.dto';
import { BelongsTo, HasMany } from 'sequelize';
import { AssessmentListRequestDto } from '@/models/dtos/assessment-list.dto';
import { Op } from 'sequelize';
import { QuestionType, ScoringType } from '@/models/enums/assessment.enum';
import { ConteTypes } from '@/models/enums/contentType.enum';

class AssessmentServices {
	private assessmentMaster = DB.AssessmentMaster;
	private assessmentQuestionMatrix = DB.AssessmentQuestionMatrix;
	private assessmentOption = DB.AssessmentOption;
	private skillMatrix = DB.SkillMatrix;
	private content = DB.Content;
	private tenant = DB.Tenant;
	private users = DB.Users;
	constructor() {}

	private async validateQuestion(assessmentData: assessmentDto) {
		const questions: questionData[] = assessmentData.questions;

		if (assessmentData.totalQuestion !== questions.length) {
			throw new BadRequestException(assessmentMessage.questionIsMissing);
		}

		for (let i = 0; i < questions.length; i++) {
			const questionElement = questions[i];

			if (assessmentData.scoring == ScoringType.PerQuestion) {
				if (!questionElement.score) {
					throw new BadRequestException(`question.${i}.` + `${assessmentMessage.scoreIsRequiredInPerQuestion}`);
				}
			}

			if (assessmentData.scoring == ScoringType.MaxScore) {
				if (!assessmentData.score) {
					throw new BadRequestException(`question.${i}.` + `${assessmentMessage.scoreIsRequiredInMaxScoreTypeQuestion}`);
				}
			}

			if (questionElement.type == QuestionType.SingleSelect) {
				if (!questionElement.answer) {
					throw new BadRequestException(`question.${i}.` + `${assessmentMessage.correctAnswerIsRequired}`);
				}
			}

			if (questionElement.answer) {
				if (!questionElement.options.includes(questionElement.answer)) {
					throw new BadRequestException(`question.${i}.` + `${assessmentMessage.correctAnswerIsNotInOptions}`);
				}
			}

			if (!questionElement.options.length) {
				throw new BadRequestException(`question.${i}.` + `${assessmentMessage.optiopnIsMissing}`);
			}
		}
	}
	private async storeQuestion(questionList: questionData[], assessmentId: number) {
		for (const questionElement of questionList) {
			const questionObj = {};

			questionObj['question'] = questionElement.question;
			questionObj['type'] = questionElement.type;
			questionObj['assessmentId'] = assessmentId;

			const createQuestion = await this.assessmentQuestionMatrix.create(questionObj);
			let currectAnswerId;
			const optionsIds = [];
			for (let i = 0; i < questionElement.options.length; i++) {
				const option = await this.assessmentOption.create({ option: questionElement.options[i], questionId: createQuestion.id });
				optionsIds.push(option.id);
				if (questionElement.options[i] === questionElement.answer) {
					currectAnswerId = option.id;
				}
			}
			await this.assessmentQuestionMatrix.update({ correctAnswer: currectAnswerId, optionIds: optionsIds }, { where: { id: createQuestion.id } });
		}
	}
	public async add(assessmentData: assessmentDto, createdUser: JwtTokenData) {
		const tenant = await this.tenant.findOne({
			where: {
				id: assessmentData.tenantId,
				isDeleted: false,
			},
		});
		if (!tenant) {
			throw new BadRequestException(TenantMessage.tenantNotFound);
		}

		let assessmentId;
		try {
			/** validate all question  */
			await this.validateQuestion(assessmentData);

			/** create new assessment records  */
			let assessment = new this.assessmentMaster();
			assessment.name = assessmentData.name;
			assessment.description = assessmentData.description;
			assessment.pass = assessmentData.pass;
			assessment.createdBy = createdUser.id;
			assessment.scoring = assessmentData.scoring;
			assessment.timed = assessmentData.timed;
			assessment.totalQuestion = assessmentData.totalQuestion;
			assessment = await assessment.save();
			assessmentId = assessment.id;

			if (assessmentData.scoring === ScoringType.MaxScore) {
				assessment.score = assessmentData.score;
			}

			const questionList: questionData[] = assessmentData.questions;

			/** store assessment question */
			await this.storeQuestion(questionList, assessmentId);
			const content = await this.content.create({
				name: assessmentData.name,
				type: ConteTypes.Assessment,
				description: assessmentData.description,
				tenantId: assessmentData.tenantId,
				assessmentId,
			});

			if (assessmentData.skill && assessmentData.skill.length) {
				const skills = assessmentData.skill.map(skill => ({
					skill: skill,
					contentId: content.id,
				}));
				await this.skillMatrix.bulkCreate(skills);
			}
		} catch (error) {
			throw new BadRequestException(error.message);
		}
		return { id: assessmentId };
	}
	public async update(assessmentData: assessmentDto, assessmentId: number, updatedUser: JwtTokenData) {
		const content = await this.content.findOne({
			where: {
				assessmentId: assessmentId,
				isDeleted: false,
				type: ConteTypes.Assessment,
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

		if (assessmentData.questions) {
			await this.validateQuestion(assessmentData);
			await this.storeQuestion(assessmentData.questions, assessment.id);
		}

		if (assessmentData.skill.length) {
			const skills = assessmentData.skill.map(skill => ({
				skill: skill,
				contentId: content.id,
			}));
			await this.skillMatrix.bulkCreate(skills);
		}
		assessment.name = assessmentData.name;
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
			attributes: ['name', 'description', 'totalQuestion', 'scoring', 'id'],
			include: [
				{
					association: new BelongsTo(this.assessmentMaster, this.users, { as: 'creator', foreignKey: 'createdBy' }),
					attributes: ['firstName', 'lastName'],
				},
				{
					association: new BelongsTo(this.assessmentMaster, this.users, { as: 'updater', foreignKey: 'updatedBy' }),
					attributes: ['firstName', 'lastName'],
				},
				{
					association: new HasMany(this.assessmentMaster, this.assessmentQuestionMatrix, { as: 'question', foreignKey: 'assessmentId' }),
					attributes: ['question', 'type', 'score'],
					include: [
						{
							association: new HasMany(this.assessmentQuestionMatrix, this.assessmentOption, { as: 'options', foreignKey: 'questionId' }),
							attributes: ['id', 'option'],
						},
						{
							association: new BelongsTo(this.assessmentQuestionMatrix, this.assessmentOption, { as: 'answer', foreignKey: 'correctAnswer' }),
							attributes: ['id', 'option'],
						},
					],
				},
			],
		});

		if (!assessment) {
			throw new BadRequestException(assessmentMessage.assessmentNotFound);
		}
		return assessment;
	}
	public async delete(assessmentId: number, userId: number) {
		const assessment = await this.assessmentMaster.findOne({
			where: {
				id: assessmentId,
				isDeleted: false,
			},
		});
		if (!assessment) {
			throw new BadRequestException(assessmentMessage.assessmentNotFound);
		}

		assessment.isDeleted = true;
		assessment.updatedBy = userId;

		await assessment.save();
		await this.assessmentQuestionMatrix.update({ isDeleted: true }, { where: { assessmentId: assessmentId } });

		return { id: assessment.id };
	}
	public async all(pageModel: AssessmentListRequestDto) {
		const page = pageModel.page || 1,
			limit = pageModel.limit || 10,
			orderByField = pageModel.sortField || 'id',
			sortDirection = pageModel.sortOrder || 'ASC';
		const offset = (page - 1) * limit;
		let condition = {};

		if (pageModel?.filter?.contentId) {
			condition = {
				[Op.or]: [{ contentId: pageModel.filter.contentId }, { contentId: null }],
			};
		}
		if (pageModel?.search) {
			condition = {
				...condition,
				name: { [Op.iLike]: `%${pageModel.search}%` },
				description: { [Op.iLike]: `%${pageModel.search}%` },
			};
		}

		const assessmentList = await this.assessmentMaster.findAndCountAll({
			where: { isDeleted: false, ...condition },
			offset,
			limit,
			attributes: ['id', 'name', 'description', 'totalQuestion', 'scoring', 'pass'],
			include: [
				{
					association: new BelongsTo(this.assessmentMaster, this.users, { as: 'creator', foreignKey: 'createdBy' }),
					attributes: ['firstName', 'lastName'],
				},
				{
					association: new BelongsTo(this.assessmentMaster, this.users, { as: 'updater', foreignKey: 'updatedBy' }),
					attributes: ['firstName', 'lastName'],
				},
				{
					association: new HasMany(this.assessmentMaster, this.assessmentQuestionMatrix, { as: 'question', foreignKey: 'assessmentId' }),
					attributes: ['question', 'type', 'score'],
					include: [
						{
							association: new HasMany(this.assessmentQuestionMatrix, this.assessmentOption, { as: 'options', foreignKey: 'questionId' }),
							attributes: ['id', 'option'],
						},
						{
							association: new BelongsTo(this.assessmentQuestionMatrix, this.assessmentOption, { as: 'answer', foreignKey: 'correctAnswer' }),
							attributes: ['id', 'option'],
						},
					],
				},
			],
			distinct: true,
			order: [[orderByField, sortDirection]],
		});
		return assessmentList;
	}
}

export default AssessmentServices;
