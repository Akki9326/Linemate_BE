import { ForgotPasswordDto, LoginOTPDto, ResetPasswordDto } from '@/models/dtos/login.dto';
import { User } from '@/models/interfaces/users.interface';
import UserService from '@/services/user.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import AuthService from '@services/auth.service';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class AuthController {
  public authService = new AuthService();
  public userService = new UserService();

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData:User = req.body;
      const userResponse = await this.userService.addAdmin(userData);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginOTPDto: LoginOTPDto = req.body;
      const tokenInfo = await this.authService.loginUser(loginOTPDto);

      AppResponseHelper.sendSuccess(res, 'Success', tokenInfo);
    }
    catch (ex) {
      next(ex)
    }
  };
  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const forgotPasswordDto: ForgotPasswordDto = req.body;
      const tokenInfo = await this.authService.sendResetPasswordOTP(forgotPasswordDto);

      AppResponseHelper.sendSuccess(res, 'Success', tokenInfo);
    }
    catch (ex) {
      next(ex)
    }
  };
  public verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {otp} = req.body;
      const tokenInfo = await this.authService.verifyOtp(otp);
      AppResponseHelper.sendSuccess(res, 'Success', tokenInfo);
    }
    catch (ex) {
      next(ex)
    }
  };
  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resetPasswordDto:ResetPasswordDto = req.body;
      const tokenInfo = await this.authService.resetPassword(resetPasswordDto);
      AppResponseHelper.sendSuccess(res, 'Success', tokenInfo);
    }
    catch (ex) {
      next(ex)
    }
  };

}

export default AuthController;
