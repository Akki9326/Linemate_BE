import AssessmentController from '@/controllers/assessment.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { assessmentDto, questionsBank } from '@/models/dtos/assessment.dto';
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
		this.router.post(`${this.path}/v1/add`, validationMiddleware(assessmentDto, 'body'), authMiddleware, this.assessmentController.add);
		this.router.put(`${this.path}/v1/:id`, validationMiddleware(assessmentDto, 'body'), authMiddleware, this.assessmentController.update);
		this.router.get(`${this.path}/v1/:id`, authMiddleware, this.assessmentController.one);
		this.router.delete(`${this.path}/v1/:id`, authMiddleware, this.assessmentController.delete);
		this.router.post(`${this.path}/v1/list`, authMiddleware, this.assessmentController.list);
		this.router.post(`${this.path}/v1/upload-question/:id`, validationMiddleware(questionsBank, 'body'), this.assessmentController.uploadQuestion);
		this.router.put(`${this.path}/v1/update-question/:id`, validationMiddleware(questionsBank, 'body'), this.assessmentController.updateQuestion);
	}
}

export default AssessmentRoute;
