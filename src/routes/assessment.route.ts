import AssessmentController from '@/controllers/assessment.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { questionsBank } from '@/models/dtos/assessment.dto';
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
	}
}

export default AssessmentRoute;
