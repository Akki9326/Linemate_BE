import VariableController from '@/controllers/variable.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import headerMiddleware from '@/middlewares/header.middleWare';
import { VariableDto } from '@/models/dtos/variable.dto';
import { Routes } from '@/models/interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { Router } from 'express';

class VariableRoute implements Routes {
	public path = '/variable';
	public router = Router();
	public variableController = new VariableController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(`${this.path}/v1/add`, validationMiddleware(VariableDto, 'body'), authMiddleware, this.variableController.add);
		this.router.put(`${this.path}/v1/:id`, validationMiddleware(VariableDto, 'body'), authMiddleware, this.variableController.update);
		this.router.post(`${this.path}/v1/list`, authMiddleware, headerMiddleware, this.variableController.list);
		this.router.get(`${this.path}/v1/:id`, authMiddleware, this.variableController.one);
		this.router.post(`${this.path}/v1/:id`, authMiddleware, this.variableController.delete);
	}
}

export default VariableRoute;
