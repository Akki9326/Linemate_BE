import { LoginDto } from '@/models/dtos/login.dto';
import { UserDto } from '@/models/dtos/user.dto';
import UserService from '@/services/user.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import AuthService from '@services/auth.service';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class AuthController {
  public authService = new AuthService();
  public userService = new UserService();

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: UserDto = req.body;
      const userResponse = await this.userService.add(userData);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: LoginDto = req.body;
      const tokenInfo = await this.authService.login(userData);

      AppResponseHelper.sendSuccess(res, 'Success', tokenInfo);
    }
    catch (ex) {
      next(ex)
    }
  };

}

export default AuthController;
