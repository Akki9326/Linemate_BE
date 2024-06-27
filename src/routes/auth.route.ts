import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { Routes } from '@/models/interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import validationMiddleware from '@middlewares/validation.middleware';
import { LoginDto } from '@/models/dtos/login.dto';
import { accessMiddlerware } from '@/middlewares/access.middulerware';
import { AppPermission } from '@/models/enums/app-access.enum';
import { RegisterUserDto } from '@/models/dtos/register-user.dto';
import { ForgotPasswordDto } from '@/models/dtos/forgot-password.dto';
import { ResetPasswordByTokenDto } from '@/models/dtos/reset-password.dto';
import { UpdatePasswordDto } from '@/models/dtos/update-password.dto';
import { GetUserByForgotToken } from '@/models/dtos/user-by-forgot-token.dto';


class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.post(`${this.path}/v1/login`, validationMiddleware(LoginDto, 'body'), this.authController.logIn);
    // this.router.post(`${this.path}/v1/register`, validationMiddleware(RegisterUserDto, 'body'), this.authController.register);
    // this.router.get(`${this.path}/v1/profile`, authMiddleware, accessMiddlerware([AppPermission.AUTH]), this.authController.profile);
    // this.router.post(`${this.path}/v1/forgotPassword`, validationMiddleware(ForgotPasswordDto, 'body'), this.authController.forgotPassword);
    // this.router.post(`${this.path}/v1/resetPasswordByToken`, validationMiddleware(ResetPasswordByTokenDto, 'body'), this.authController.resetPasswordByToken);
    // this.router.put(`${this.path}/v1/updatePassword`, authMiddleware, accessMiddlerware([AppPermission.AUTH]), validationMiddleware(UpdatePasswordDto, 'body'), this.authController.updatePassword);
    // this.router.get(`${this.path}/v1/userByForgotToken`, validationMiddleware(GetUserByForgotToken, 'query'), this.authController.getUserFromForgotToken);
    // this.router.post(`${this.path}/v1/logout`, this.authController.logout);



  }
}

export default AuthRoute;
