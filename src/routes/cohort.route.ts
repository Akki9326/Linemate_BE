import CohortController from '@/controllers/cohort.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import headerMiddleware from '@/middlewares/header.middleWare';
import validationMiddleware from '@/middlewares/validation.middleware';
import { CohortDto } from '@/models/dtos/cohort.dto';
import { Routes } from '@/models/interfaces/routes.interface';
import { Router } from 'express';

class CohortRoute implements Routes {
	public path = '/cohort';
	public router = Router();
	public cohortController = new CohortController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(`${this.path}/v1/rule-options`, authMiddleware, headerMiddleware, this.cohortController.ruleOptions);
		this.router.post(`${this.path}/v1/add`, validationMiddleware(CohortDto, 'body'), authMiddleware, this.cohortController.add);
		this.router.put(`${this.path}/v1/:id`, validationMiddleware(CohortDto, 'body'), authMiddleware, this.cohortController.update);
		this.router.get(`${this.path}/v1/:id`, authMiddleware, this.cohortController.getById);
		this.router.post(`${this.path}/v1/list`, authMiddleware, headerMiddleware, this.cohortController.list);
		this.router.delete(`${this.path}/v1/:id`, authMiddleware, this.cohortController.delete);
	}
}

export default CohortRoute;
