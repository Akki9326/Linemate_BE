import { AnswerRequest, questionData } from '@/models/dtos/assessment.dto';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import AssessmentServices from '@/services/assessment.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Response } from 'express-serve-static-core';

class AssessmentController {
	public AssessmentServices = new AssessmentServices();

	public uploadQuestion = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const contentId = parseInt(req.params.id);
			const questionData: questionData[] = req.body.questions;
			const assessmentResponse = await this.AssessmentServices.uploadQuestion(contentId, questionData);
			AppResponseHelper.sendSuccess(res, 'Success', assessmentResponse);
		} catch (ex) {
			next(ex);
		}
	};

	public getAssessmentDetails = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const contentId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const assessmentResponse = await this.AssessmentServices.one(contentId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', assessmentResponse);
		} catch (ex) {
			next(ex);
		}
	};

	public startAssessment = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const contentId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const assessmentResponse = await this.AssessmentServices.startAssessment(contentId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', assessmentResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public setAnswer = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const contentId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const answerRequest = req.body as AnswerRequest;
			const assessmentResponse = await this.AssessmentServices.setAnswer(contentId, answerRequest, userId);
			AppResponseHelper.sendSuccess(res, 'Success', assessmentResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public getResult = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const contentId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const assessmentResponse = await this.AssessmentServices.getResult(contentId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', assessmentResponse);
		} catch (ex) {
			next(ex);
		}
	};
}

export default AssessmentController;
