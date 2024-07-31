import { UserListDto } from '@/models/dtos/user-list.dto';
import { ChangePasswordDto, ImportUserDto, UserActionDto, UserDto } from '@/models/dtos/user.dto';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import UserService from '@/services/user.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Response } from 'express-serve-static-core';

class UserController {
	public userService = new UserService();

	public add = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const userData: UserDto = req.body;
			const user = req.user as JwtTokenData;
			const userResponse = await this.userService.add(userData, user);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public one = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const userId = parseInt(req.params.id);
			const tenantId = req.tenantId as number;
			const userResponse = await this.userService.one(userId, tenantId);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public delete = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const userIds = req.body.userIds as UserListDto;
			const userId: number = req.user.id;
			const userResponse = await this.userService.delete(userIds, userId);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const userId = parseInt(req.params.id);
			const userData: UserDto = req.body;
			const updatedBy = req.user.id as number;
			const userResponse = await this.userService.update(userData, userId, updatedBy);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const pageModel = req.body as UserListDto;
			const tenantId = req.tenantId as number;
			const userResponse = await this.userService.all(pageModel, tenantId);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public deActiveUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const userIds = req.body.userIds as UserActionDto;
			const userId: number = req.user.id;
			const userResponse = await this.userService.deActive(userIds, userId);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public changePassword = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const changePasswordUsers = req.body as ChangePasswordDto;
			const createdBy = req.user as JwtTokenData;
			const userResponse = await this.userService.changePassword(changePasswordUsers, createdBy);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public downloadUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const tenantId = parseInt(req.params.tenantId) as number;
			const userResponse = await this.userService.downloadUser(tenantId);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public importUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const tenantId = parseInt(req.params.tenantId) as number;
			const userData: ImportUserDto[] = req.body.data;
			const userResponse = await this.userService.importUser(tenantId, userData);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};
}

export default UserController;
