import AssessmentController from '@/controllers/assessment.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import mobileAuthMiddleware from '@/middlewares/mobileAuth.middleware';

import validationMiddleware from '@/middlewares/validation.middleware';
import { AnswerRequest, questionsBank } from '@/models/dtos/assessment.dto';
import { Routes } from '@/models/interfaces/routes.interface';
import { Router } from 'express';

class AssessmentRoute implements Routes {
	public path = '/assessment';
	public router = Router();
	public assessmentController = new AssessmentController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(
			`${this.path}/v1/upload-question/:id`,
			authMiddleware,
			validationMiddleware(questionsBank, 'body'),
			this.assessmentController.uploadQuestion,
		);
		this.router.get(`${this.path}/v1/mobile/:id`, mobileAuthMiddleware, this.assessmentController.getAssessmentDetails);
		this.router.post(`${this.path}/v1/mobile/start-assessment/:id`, mobileAuthMiddleware, this.assessmentController.startAssessment);
		this.router.get(`${this.path}/v1/mobile/questions/:id`, mobileAuthMiddleware, this.assessmentController.getAssessmentQuestions);
		this.router.post(
			`${this.path}/v1/mobile/set-answer/:id`,
			mobileAuthMiddleware,
			validationMiddleware(AnswerRequest, 'body'),
			this.assessmentController.setAnswer,
		);
		this.router.post(`${this.path}/v1/mobile/get-result/:id`, mobileAuthMiddleware, this.assessmentController.getResult);
	}
}

export default AssessmentRoute;
