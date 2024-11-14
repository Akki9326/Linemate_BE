import { BadRequestException } from '@/exceptions/BadRequestException';
import { assessmentMasterModel } from '@/models/db/assessmentMaster';
import { ContentModel } from '@/models/db/content.model';
import { AnswerRequest, assessmentDto, questionData } from '@/models/dtos/assessment.dto';
import { QuestionType, ResultType, ScoringType, timeType } from '@/models/enums/assessment.enum';
import { ConteTypes } from '@/models/enums/contentType.enum';
import { assessmentMessage, ContentMessage } from '@/utils/helpers/app-message.helper';
import DB from '@databases';
import { BelongsTo, HasMany, Op } from 'sequelize';
import { ContentService } from './content.service';
import moment from 'moment';
import { NotFoundException } from '@/exceptions/NotFoundException';

class AssessmentServices {
	private assessmentMaster = DB.AssessmentMaster;
	private assessmentQuestionMatrix = DB.AssessmentQuestionMatrix;
	private assessmentOption = DB.AssessmentOption;
	private assessmentResult = DB.AssessmentResult;
	private assessmentAnswerMatrix = DB.AssessmentAnswerMatrix;
	private user = DB.Users;
	private content = DB.Content;
	public contentService = new ContentService();
	constructor() { }

	private async validateQuestion(assessmentData: assessmentDto) {
		const questions: questionData[] = assessmentData.questions;

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

			if (!questionElement.options.length) {
				throw new BadRequestException(`question.${i}.` + `${assessmentMessage.optiopnIsMissing}`);
			}
		}
	}
	private async storeQuestion(questionList: questionData[], assessmentId: number) {
		const questionIds = [];
		for (const questionElement of questionList) {
			let question;

			// Handling the question - update if it exists, otherwise create a new one
			if (questionElement.questionId) {
				question = await this.assessmentQuestionMatrix.findOne({
					where: {
						id: questionElement.questionId,
						isDeleted: false,
					},
				});
				if (!question) {
					throw new BadRequestException(assessmentMessage.questionNotFound);
				}
				question.question = questionElement.question;
				question.type = questionElement.type;
				question.score = questionElement.score;
				await question.save();
			} else {
				question = await this.assessmentQuestionMatrix.create({
					question: questionElement.question,
					type: questionElement.type,
					assessmentId: assessmentId,
					score: questionElement.score,
				});
			}

			questionIds.push(question.id);

			const optionIds = [];
			for (const optionElement of questionElement.options) {
				let option;
				if (optionElement.optionId) {
					option = await this.assessmentOption.findOne({
						where: {
							id: optionElement.optionId,
						},
					});
					if (option) {
						option.option = optionElement.option;
						option.isCorrectAnswer = optionElement.isCorrectAnswer;
						await option.save();
					}
				} else {
					option = await this.assessmentOption.create({
						option: optionElement.option,
						isCorrectAnswer: optionElement.isCorrectAnswer,
						questionId: question.id,
					});
				}
				optionIds.push(option.id);
			}

			// Update the question to reflect the options
			await this.assessmentQuestionMatrix.update({ optionIds: optionIds }, { where: { id: question.id } });

			// Delete options that are not in the provided optionIds
			await this.assessmentOption.update(
				{ isDeleted: true },
				{
					where: {
						questionId: question.id,
						id: {
							[Op.notIn]: optionIds,
						},
					},
				},
			);
		}

		// Delete questions that are not in the provided questionIds
		await this.assessmentQuestionMatrix.update(
			{ isDeleted: true },
			{
				where: {
					assessmentId: assessmentId,
					id: {
						[Op.notIn]: questionIds,
					},
				},
			},
		);
	}

	public async uploadQuestion(contentId: number, questionData: questionData[]) {
		const content = await this.content.findOne({
			where: {
				id: contentId,
				isDeleted: false,
				type: ConteTypes.Assessment,
			},
		});

		if (!content) {
			throw new BadRequestException(ContentMessage.contentNotFound);
		}

		const assessment = await this.assessmentMaster.findOne({
			where: {
				id: content.assessmentId,
				isDeleted: false,
			},
			// raw: true,
		});
		if (!assessment) {
			throw new BadRequestException(assessmentMessage.assessmentNotFound);
		}
		let score = 0;
		for (const question of questionData) {
			score += question.score;
		}
		const totalQuestion = questionData.length;
		const assessmentData: assessmentDto = {
			name: assessment.name,
			description: assessment.description,
			scoring: assessment.scoring,
			timed: assessment.timed,
			pass: assessment.pass,
			score: score,
			tenantId: content.tenantId,
			questions: questionData,
			skill: [],
			totalQuestion,
		};
		await this.validateQuestion(assessmentData);
		await this.storeQuestion(questionData, assessment.id);

		content.isPublish = true;
		assessment.totalQuestion = totalQuestion;
		assessment.score = assessment?.scoring === ScoringType.MaxScore ? assessment.score : score;
		assessment.save();
		content.save();
	}

	private async checkIsValidAssessment(assessmentDetails: ContentModel, tenantIds: number[]) {
		const tenantId = assessmentDetails.tenantId;
		if (!tenantIds.includes(tenantId)) {
			throw new BadRequestException(assessmentMessage.assessmentNotAssigning);
		}
	}

	public async one(contentId: number, userId: number) {
		const userDetails = await this.user.findOne({ where: { id: userId, isDeleted: false } });
		const contentDetails = await this.content.findOne({ where: { id: contentId, isDeleted: false } });
		let assessmentDetails: assessmentMasterModel;
		if (contentDetails) {
			assessmentDetails = await this.assessmentMaster.findOne({
				where: { id: contentDetails.assessmentId, isDeleted: false },
				attributes: ['name', 'description', 'totalQuestion', 'scoring', 'timed', 'pass', 'score', 'timeType'],
			});
			if (!assessmentDetails) {
				throw new BadRequestException(assessmentMessage.assessmentNotFound);
			}
		} else {
			throw new BadRequestException(assessmentMessage.assessmentNotFound);
		}
		await this.checkIsValidAssessment(contentDetails, userDetails.tenantIds);

		return assessmentDetails;
	}
	public async assessmentQuestions(contentId: number) {

		const contentDetails = await this.content.findOne({ where: { id: contentId, isDeleted: false } });
		if (contentDetails) {
			const assessment = this.assessmentMaster.findOne({
				where: {
					id: contentDetails.assessmentId,
				},
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
								attributes: ['id', 'option'],
							},
						],
					},
				],
			});

			return assessment;
		} else throw new NotFoundException(`Content Details not found`, { contentId });
	}

	public async startAssessment(contentId: number, userId: number) {
		let assessmentResultId = 0;
		const userDetails = await this.user.findOne({ where: { id: userId, isDeleted: false } });
		const contentDetails = await this.content.findOne({ where: { id: contentId, isDeleted: false } });
		let assessmentDetails;
		if (contentDetails) {
			assessmentDetails = await this.content.findOne({
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
										attributes: ['id', 'option'],
									},
								],
							},
						],
					},
				],
			});
			const timedDuration = typeof assessmentDetails?.assessment?.timed === 'number' ? assessmentDetails?.assessment?.timed : 0;
			const endTime = assessmentDetails?.assessment?.timeType === timeType.Timed ? moment().add(timedDuration, 'minute').toISOString() : null;
			const assessmentResult = new this.assessmentResult();
			assessmentResult.userId = userId;
			assessmentResult.assessmentId = contentDetails.assessmentId;
			assessmentResult.contentId = contentDetails.id;
			assessmentResult.startTime = new Date();
			assessmentResult.endTime = endTime ? new Date(endTime) : null;
			assessmentResult.totalScore = 0;
			assessmentResult.resultType = null;
			assessmentResult.correctAnswerCount = 0;
			assessmentResult.wrongAnswerCount = 0;
			assessmentResult.unAttemptQuestionCount = 0;
			await assessmentResult.save();
			assessmentResultId = assessmentResult.id;
			if (!assessmentDetails) {
				throw new BadRequestException(assessmentMessage.assessmentNotFound);
			}

			if (!assessmentDetails) {
				throw new BadRequestException(assessmentMessage.assessmentNotFound);
			}
		} else {
			throw new BadRequestException(assessmentMessage.assessmentNotFound);
		}
		await this.checkIsValidAssessment(contentDetails, userDetails.tenantIds);

		return {
			...assessmentDetails?.assessment?.dataValues,
			assessmentResultId,
		};
	}
	public async setAnswer(contentId: number, answerRequest: AnswerRequest, userId: number) {
		const assessmentResult = await this.assessmentResult.findOne({ where: { id: answerRequest.assessmentResultId, userId, contentId: contentId } });
		if (!assessmentResult) {
			throw new BadRequestException(assessmentMessage.assessmentNotStarted);
		}
		const currentTime = new Date();
		const endTime = assessmentResult.endTime ? new Date(assessmentResult.endTime) : null;

		let checkEndTimeValidation = true;

		if (endTime) {
			const timeDifference = endTime.getTime() - currentTime.getTime();
			checkEndTimeValidation = timeDifference > 0;
		}
		if (checkEndTimeValidation) {
			const checkAlreadyExistsAnswer = await this.assessmentAnswerMatrix.findOne({
				where: { assessmentResultId: assessmentResult.id, questionId: answerRequest.questionId, isDeleted: false },
			});
			const findQuestionDetails = await this.assessmentQuestionMatrix.findOne({
				where: {
					id: answerRequest.questionId,
					assessmentId: assessmentResult.assessmentId,
				},
			});
			if (!findQuestionDetails) {
				throw new BadRequestException(assessmentMessage.questionNotFoundInAssessment);
			}
			const findOptionDetails = await this.assessmentOption.findAll({
				where: {
					id: { [Op.in]: answerRequest.userAnswerIds },
				},
			});

			const validOptions = findOptionDetails.every(option => option.questionId === answerRequest.questionId);
			if (!validOptions) {
				throw new BadRequestException('Please select valid option.');
			}

			if (checkAlreadyExistsAnswer) {
				checkAlreadyExistsAnswer.userAnswerIds = answerRequest.userAnswerIds;
				await checkAlreadyExistsAnswer.save();
			} else {
				const assessmentAnswer = new this.assessmentAnswerMatrix();
				assessmentAnswer.assessmentResultId = assessmentResult.id;
				assessmentAnswer.questionId = answerRequest.questionId;
				assessmentAnswer.userAnswerIds = answerRequest.userAnswerIds;
				await assessmentAnswer.save();
			}
		} else {
			throw new BadRequestException(assessmentMessage.assessmentTimeOver);
		}
	}
	public async getResult(contentId: number, assessmentResultId: number, userId: number) {
		const assessmentResult = await this.assessmentResult.findOne({
			where: { userId, contentId: contentId, id: assessmentResultId },
		});
		if (!assessmentResult) {
			throw new BadRequestException(assessmentMessage.assessmentNotStarted);
		}
		const assessmentDetail = await this.assessmentMaster.findOne({
			where: { id: assessmentResult.assessmentId, isDeleted: false },
		});
		if (!assessmentDetail) {
			throw new BadRequestException(assessmentMessage.assessmentNotFound);
		}
		const questions = await this.assessmentQuestionMatrix.findAll({
			where: { assessmentId: assessmentDetail.id, isDeleted: false },
		});

		const userAnswers = await this.assessmentAnswerMatrix.findAll({
			where: { assessmentResultId: assessmentResult.id },
		});
		let totalScore = 0;
		let correctAnswerCount = 0;
		let wrongAnswerCount = 0;
		let unAttemptQuestionCount = 0;
		const totalQuestions = questions.length;
		const questionResults = [];

		for (const question of questions) {
			const userAnswer = userAnswers.find(answer => answer.questionId === question.id);
			const correctAnswers = await this.getCorrectAnswerIds(question);

			let isCorrect = false;

			if (!userAnswer) {
				unAttemptQuestionCount++;
			} else {
				isCorrect = await this.isCorrectAnswer(question, userAnswer);
				if (isCorrect) {
					if (assessmentDetail?.scoring === ScoringType.MaxScore) {
						totalScore += assessmentDetail?.score / questions?.length;
					} else {
						totalScore += question?.score;
					}
					correctAnswerCount++;
				} else {
					wrongAnswerCount++;
				}
			}

			questionResults.push({
				questionId: question.id,
				questionType: question.type,
				correctAnswerIds: correctAnswers,
				userAnswerIds: userAnswer ? userAnswer.userAnswerIds : [],
				isCorrect,
			});
		}
		const percentageScore = (totalScore / assessmentDetail?.score) * 100;
		console.log('totalScore', totalScore);
		console.log('totalQuestions', totalQuestions);

		let isPass = false;
		if (assessmentDetail?.scoring === ScoringType.PerQuestion) {
			isPass = percentageScore >= assessmentDetail.pass;
		} else if (assessmentDetail?.scoring === ScoringType.MaxScore) {
			isPass = percentageScore >= assessmentDetail.pass;
		} else if (assessmentDetail?.scoring === ScoringType.NoScore) {
			isPass = null;
		}
		const resultType = isPass === null ? null : isPass ? ResultType.Pass : ResultType.Fail;
		await this.assessmentResult.update(
			{
				totalScore,
				correctAnswerCount,
				wrongAnswerCount,
				unAttemptQuestionCount,
				resultType,
			},
			{ where: { id: assessmentResult.id } },
		);

		return {
			totalScore: assessmentDetail?.score,
			userScore: totalScore,
			correctAnswerCount,
			wrongAnswerCount,
			unAttemptQuestionCount,
			resultType,
			percentageScore: assessmentDetail?.scoring === ScoringType.NoScore ? 0 : parseFloat(percentageScore.toFixed(2)),
			questions: questionResults,
		};
	}

	private async getCorrectAnswerIds(question): Promise<number[]> {
		const correctOptions = await this.assessmentOption.findAll({
			where: { questionId: question.id, isCorrectAnswer: true },
		});
		return correctOptions.map(option => option.id);
	}

	private async isCorrectAnswer(question, userAnswer): Promise<boolean> {
		if (question.type === QuestionType.SingleSelect) {
			if (userAnswer.userAnswerIds.length !== 1) return false;

			const selectedOptionId = userAnswer.userAnswerIds[0];
			const option = await this.assessmentOption.findOne({
				where: { id: selectedOptionId, isCorrectAnswer: true },
			});

			return option !== null;
		} else if (question.type === QuestionType.MultiSelect) {
			const correctOptions = await this.assessmentOption.findAll({
				where: { questionId: question.id, isCorrectAnswer: true },
			});

			const correctAnswerIds = correctOptions.map(option => option.id);

			const hasAnyCorrectAnswer = userAnswer.userAnswerIds.some(id => correctAnswerIds.includes(id));

			return hasAnyCorrectAnswer;
		} else if (question.type === QuestionType.Boolean) {
			if (userAnswer.userAnswerIds.length !== 1) return false;

			const selectedOptionId = userAnswer.userAnswerIds[0];
			const correctOption = await this.assessmentOption.findOne({
				where: { questionId: question.id, isCorrectAnswer: true },
			});

			return correctOption && correctOption.id === selectedOptionId;
		}

		return false;
	}
}

export default AssessmentServices;
