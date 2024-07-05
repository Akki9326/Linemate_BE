import { ListRequestDto } from '@/models/dtos/list-request.dto';
import { UserDto } from '@/models/dtos/user.dto';
import { User } from '@/models/interfaces/users.interface';
import UserService from '@/services/user.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class UserController {
  public userService = new UserService();

  public add = async (req: Request & { user: User }, res: Response, next: NextFunction) => {
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
  public one = async (req: Request & { user: User }, res: Response, next: NextFunction) => {
    try {
      const userId= parseInt(req.params.id)
      const userResponse = await this.userService.one(userId);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public delete = async (req: Request & { user: User }, res: Response, next: NextFunction) => {
    try {
      const userId= parseInt(req.params.id)
      const userResponse = await this.userService.delete(userId);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public update = async (req: Request & { user: User }, res: Response, next: NextFunction) => {
    try {
      const userId= parseInt(req.params.id)
      const userData: UserDto = req.body;
      const userResponse = await this.userService.update(userData,userId);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public list = async (req: Request & { user: User }, res: Response, next: NextFunction) => {
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

}

export default UserController;
