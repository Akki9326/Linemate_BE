import ContentController from '@/controllers/content.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import headerMiddleware from '@/middlewares/header.middleWare';
import { ContentDto } from '@/models/dtos/content.dto';
import { Routes } from '@/models/interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { Router } from 'express';

class ContentRoute implements Routes {
	public path = '/content';
	public router = Router();
	public contentController = new ContentController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(`${this.path}/v1/add`, validationMiddleware(ContentDto, 'body'), authMiddleware, this.contentController.add);
		this.router.put(`${this.path}/v1/:id`, validationMiddleware(ContentDto, 'body'), authMiddleware, this.contentController.update);
		this.router.get(`${this.path}/v1/:id`, authMiddleware, this.contentController.getById);
		this.router.post(`${this.path}/v1/list`, authMiddleware, headerMiddleware, this.contentController.list);
		this.router.post(`${this.path}/v1/:id`, authMiddleware, this.contentController.delete);
	}
}

export default ContentRoute;
