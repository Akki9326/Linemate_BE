import UserController from '@/controllers/user.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import headerMiddleware from '@/middlewares/header.middleWare';
import { changePasswordDto, UserActionDto, UserDto } from '@/models/dtos/user.dto';
import { Routes } from '@/models/interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { Router } from 'express';

class UserRoute implements Routes {
	public path = '/user';
	public router = Router();
	public userController = new UserController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(`${this.path}/v1/add`, validationMiddleware(UserDto, 'body'), authMiddleware, this.userController.add);
		this.router.put(`${this.path}/v1/:id`, validationMiddleware(UserDto, 'body'), authMiddleware, this.userController.update);
		this.router.post(`${this.path}/v1/list`, authMiddleware, headerMiddleware, this.userController.list);
		this.router.get(`${this.path}/v1/:id`, authMiddleware, headerMiddleware, this.userController.one);
		this.router.delete(`${this.path}/v1/delete-users`, validationMiddleware(UserActionDto, 'body'), authMiddleware, this.userController.delete);
		this.router.post(`${this.path}/v1/de-active`, validationMiddleware(UserActionDto, 'body'), authMiddleware, this.userController.deActiveUser);
		this.router.post(
			`${this.path}/v1/change-password`,
			validationMiddleware(changePasswordDto, 'body'),
			authMiddleware,
			this.userController.changePassword,
		);
		this.router.post(`${this.path}/v1/download-user/:tenantId`, this.userController.downloadUser);
		this.router.post(`${this.path}/v1/import-user/:tenantId`, this.userController.importUser);
	}
}

export default UserRoute;
