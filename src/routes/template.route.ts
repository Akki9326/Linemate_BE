import TemplateController from '@/controllers/template.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import headerMiddleware from '@/middlewares/header.middleWare';
import { TemplateDto } from '@/models/dtos/template-dto';
import { Routes } from '@/models/interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { Router } from 'express';

class TemplateRoute implements Routes {
	public path = '/template';
	public router = Router();
	public templateController = new TemplateController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(`${this.path}/v1/add`, validationMiddleware(TemplateDto, 'body'), authMiddleware, this.templateController.create);
		this.router.get(`${this.path}/v1/:id`, authMiddleware, this.templateController.one);
		this.router.post(`${this.path}/v1/list`, authMiddleware, headerMiddleware, this.templateController.list);
		this.router.delete(`${this.path}/v1/:id`, authMiddleware, this.templateController.delete);
	}
}

export default TemplateRoute;
