import UserController from '@/controllers/user.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import headerMiddleware from '@/middlewares/header.middleWare';
import { ChangePasswordDto, UserActionDto, UserDto, UserSelectDto } from '@/models/dtos/user.dto';
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
		this.router.get(`${this.path}/v1/get-user-fields/:tenantId`, authMiddleware, this.userController.getUserFields);
		this.router.get(`${this.path}/v1/:id`, authMiddleware, headerMiddleware, this.userController.one);
		this.router.post(`${this.path}/v1/delete-users`, validationMiddleware(UserActionDto, 'body'), authMiddleware, this.userController.delete);
		this.router.post(`${this.path}/v1/de-active`, validationMiddleware(UserActionDto, 'body'), authMiddleware, this.userController.deActiveUser);
		this.router.post(`${this.path}/v1/active-users`, validationMiddleware(UserActionDto, 'body'), authMiddleware, this.userController.activeUser);
		this.router.post(
			`${this.path}/v1/change-password`,
			validationMiddleware(ChangePasswordDto, 'body'),
			authMiddleware,
			this.userController.changePassword,
		);
		this.router.post(`${this.path}/v1/download-user/:tenantId`, this.userController.downloadUser);
		this.router.post(`${this.path}/v1/import-user/:tenantId`, authMiddleware, this.userController.importUser);
		this.router.post(
			`${this.path}/v1/select-user/:tenantId`,
			validationMiddleware(UserSelectDto, 'body'),
			authMiddleware,
			this.userController.selectUser,
		);
	}
}

export default UserRoute;
