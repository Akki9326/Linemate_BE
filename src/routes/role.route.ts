import RoleController from '@/controllers/role.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import headerMiddleware from '@/middlewares/header.middleWare';
import { RoleDto } from '@/models/dtos/role.dto';
import { Routes } from '@/models/interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { Router } from 'express';

class RoleRoute implements Routes {
	public path = '/role';
	public router = Router();
	public roleController = new RoleController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(`${this.path}/v1/add`, validationMiddleware(RoleDto, 'body'), authMiddleware, this.roleController.add);
		this.router.put(`${this.path}/v1/:id`, validationMiddleware(RoleDto, 'body'), authMiddleware, this.roleController.update);
		this.router.get(`${this.path}/v1/:id`, authMiddleware, this.roleController.getById);
		this.router.post(`${this.path}/v1/list`, authMiddleware, headerMiddleware, this.roleController.list);
		this.router.delete(`${this.path}/v1/:id`, authMiddleware, this.roleController.delete);
	}
}

export default RoleRoute;
