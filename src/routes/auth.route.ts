import { ForgotPasswordDto, LoginOTPDto, ResetPasswordDto } from '@/models/dtos/login.dto';
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
		this.router.post(`${this.path}/v1/forgot-password`, validationMiddleware(ForgotPasswordDto, 'body'), this.authController.forgotPassword);
		this.router.post(`${this.path}/v1/verify-otp`, this.authController.verifyOtp);
		this.router.post(`${this.path}/v1/reset-password`, validationMiddleware(ResetPasswordDto, 'body'), this.authController.resetPassword);
	}
}

export default AuthRoute;
