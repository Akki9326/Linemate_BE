import CohortController from '@/controllers/cohort.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import headerMiddleware from '@/middlewares/header.middleWare';
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
	}
}

export default CohortRoute;
