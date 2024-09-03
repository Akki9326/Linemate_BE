import { BadRequestException } from '@/exceptions/BadRequestException';
import { assessmentMessage, ContentMessage } from '@/utils/helpers/app-message.helper';
import DB from '@databases';
import { assessmentDto, questionData } from '@/models/dtos/assessment.dto';
import { ScoringType } from '@/models/enums/assessment.enum';
import { ConteTypes } from '@/models/enums/contentType.enum';
import { Op } from 'sequelize';

class AssessmentServices {
	private assessmentMaster = DB.AssessmentMaster;
	private assessmentQuestionMatrix = DB.AssessmentQuestionMatrix;
	private assessmentOption = DB.AssessmentOption;
	private content = DB.Content;
	constructor() {}

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
			raw: true,
		});
		if (!assessment) {
			throw new BadRequestException(assessmentMessage.assessmentNotFound);
		}

		const assessmentData: assessmentDto = {
			name: assessment.name,
			description: assessment.description,
			totalQuestion: assessment.totalQuestion,
			scoring: assessment.scoring,
			timed: assessment.timed,
			pass: assessment.pass,
			score: assessment.score,
			tenantId: content.tenantId,
			questions: questionData,
			skill: [],
		};
		await this.validateQuestion(assessmentData);
		await this.storeQuestion(questionData, assessment.id);
	}
}

export default AssessmentServices;
