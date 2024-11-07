import authMiddleware from '@/middlewares/auth.middleware';
import { FileTypeDto } from '@/models/dtos/file.dto';
import { ForgotPasswordDto, LoginOTPDto, MobileLoginOTPDto, MobileLoginUserName, ResetPasswordDto } from '@/models/dtos/login.dto';
import { Routes } from '@/models/interfaces/routes.interface';
import AuthController from '@controllers/auth.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { Router } from 'express';

class AuthRoute implements Routes {
	public path = '/auth';
	public router = Router();
	public authController = new AuthController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(`${this.path}/v1/login`, validationMiddleware(LoginOTPDto, 'body'), this.authController.login);
		this.router.post(`${this.path}/v1/mobile/login`, validationMiddleware(MobileLoginUserName, 'body'), this.authController.mobileLogin);
		this.router.post(`${this.path}/v1/mobile/verify-otp`, validationMiddleware(MobileLoginOTPDto, 'body'), this.authController.verifyMobileOTP);
		this.router.post(`${this.path}/v1/forgot-password`, validationMiddleware(ForgotPasswordDto, 'body'), this.authController.forgotPassword);
		this.router.post(`${this.path}/v1/verify-otp`, this.authController.verifyOtp);
		this.router.post(`${this.path}/v1/reset-password`, validationMiddleware(ResetPasswordDto, 'body'), this.authController.resetPassword);
		this.router.post(`${this.path}/v1/file-upload`, authMiddleware, validationMiddleware(FileTypeDto, 'body'), this.authController.fileUpload);
	}
}

export default AuthRoute;
