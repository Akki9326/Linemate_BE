import TenantController from '@/controllers/tenant.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import { TenantDto } from '@/models/dtos/tenant.dto';
import { Routes } from '@/models/interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { Router } from 'express';

class RoleRoute implements Routes {
	public path = '/tenant';
	public router = Router();
	public tenantController = new TenantController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(`${this.path}/v1/add`, validationMiddleware(TenantDto, 'body'), authMiddleware, this.tenantController.create);
		this.router.put(`${this.path}/v1/:id`, validationMiddleware(TenantDto, 'body'), authMiddleware, this.tenantController.updateById);
		this.router.get(`${this.path}/v1/list`, authMiddleware, this.tenantController.list);
		this.router.get(`${this.path}/v1/:id`, authMiddleware, this.tenantController.getById);
		this.router.delete(`${this.path}/v1/:id`, authMiddleware, this.tenantController.deleteById);
	}
}

export default RoleRoute;
