import { UserDto } from '@/models/dtos/user.dto';
import UserService from '@/services/user.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class UserController {
  public userService = new UserService();

  public add = async (req: Request & { user: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const userData: UserDto = req.body;
      const userId= req.user.id as string
      const userResponse = await this.userService.add(userData,userId);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };

}

export default UserController;
