import { ListRequestDto } from '@/models/dtos/list-request.dto';
import { UpdatePasswordDto } from '@/models/dtos/update-password.dto';
import { UserDto } from '@/models/dtos/user.dto';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import UserService from '@/services/user.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class UserController {
  public userService = new UserService();

  public add = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: UserDto = req.body;
      const user= req.user
      const userResponse = await this.userService.add(userData,user);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public one = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId= parseInt(req.params.id)
      const userResponse = await this.userService.one(userId);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId= parseInt(req.params.id)
      const userResponse = await this.userService.delete(userId);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId= parseInt(req.params.id)
      const userData: UserDto = req.body;
      const updatedBy= req.user.id
      const userResponse = await this.userService.update(userData,userId,updatedBy);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
       const pageModel = req.body as ListRequestDto<{}>; // Provide the missing type argument
       const user= req.user
     const userResponse = await this.userService.all(pageModel,user);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public deActiveUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId= parseInt(req.params.id)
      const userResponse = await this.userService.deActive(userId);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId= parseInt(req.params.id)
      const changePassWordDTO = req.body as UpdatePasswordDto
      const userResponse = await this.userService.changePassword(userId,changePassWordDTO);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };

}

export default UserController;
