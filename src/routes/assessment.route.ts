import AssessmentController from '@/controllers/assessment.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { assessmentDto } from '@/models/dtos/assessment.dto';
// import headerMiddleware from '@/middlewares/header.middleWare';
// import { UserVariableDto } from '@/models/dtos/user.dto';
// import { VariableDto } from '@/models/dtos/variable.dto';
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
		// this.router.post(`${this.path}/v1/list`, authMiddleware, headerMiddleware, this.variableController.list);
		// this.router.post(`${this.path}/v1/:id`, authMiddleware, this.variableController.delete);
		// this.router.post(
		// 	`${this.path}/v1/:userId`,
		// 	validationMiddleware(UserVariableDto, 'body'),
		// 	authMiddleware,
		// 	this.variableController.getUserVariable,
		// );
	}
}

export default AssessmentRoute;
