import TemplateController from '@/controllers/template.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import headerMiddleware from '@/middlewares/header.middleWare';
import { FileMediaType } from '@/models/dtos/file.dto';
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
		this.router.put(`${this.path}/v1/:id`, validationMiddleware(TemplateDto, 'body'), authMiddleware, this.templateController.update);
		this.router.get(`${this.path}/v1/:id`, authMiddleware, this.templateController.one);
		this.router.post(`${this.path}/v1/list`, authMiddleware, headerMiddleware, this.templateController.list);
		this.router.post(`${this.path}/v1/archive`, authMiddleware, this.templateController.archiveTemplate);
		this.router.post(`${this.path}/v1/delete`, authMiddleware, this.templateController.bulkDeleteTemplate);
		this.router.post(`${this.path}/v1/un-archive`, authMiddleware, this.templateController.unArchiveTemplate);
		this.router.delete(`${this.path}/v1/:id`, authMiddleware, this.templateController.delete);
		this.router.post(
			`${this.path}/v1/upload-template-content`,
			authMiddleware,
			validationMiddleware(FileMediaType, 'body'),
			this.templateController.uploadTemplateFile,
		);
	}
}

export default TemplateRoute;
