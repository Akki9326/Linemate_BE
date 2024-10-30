import PermissionController from '@/controllers/permissions.controller';
import authMiddleware from '@/middlewares/auth.middleware';

import { Routes } from '@/models/interfaces/routes.interface';
import { Router } from 'express';

class PermissionRoute implements Routes {
	public path = '/permission';
	public router = Router();
	public permissionController = new PermissionController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(`${this.path}/v1/list`, authMiddleware, this.permissionController.list);
		// this.router.post(`${this.path}/v1/add`, validationMiddleware(PermissionDto, 'body'), authMiddleware, this.permissionController.create);
		// this.router.put(`${this.path}/v1/:id`, validationMiddleware(PermissionDto, 'body'), authMiddleware, this.permissionController.update);
		// this.router.get(`${this.path}/v1/:id`, authMiddleware, this.permissionController.getById);
		// this.router.delete(`${this.path}/v1/:id`, authMiddleware, this.permissionController.delete);
	}
}

export default PermissionRoute;
