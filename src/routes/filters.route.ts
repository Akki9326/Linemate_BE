import FilterController from '@/controllers/filter.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import headerMiddleware from '@/middlewares/header.middleWare';
import { Routes } from '@/models/interfaces/routes.interface';
import { Router } from 'express';

class FiltersRoute implements Routes {
	public path = '/filters';
	public router = Router();
	public filterController = new FilterController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(`${this.path}/v1/list`, authMiddleware, headerMiddleware, this.filterController.list);
	}
}

export default FiltersRoute;
