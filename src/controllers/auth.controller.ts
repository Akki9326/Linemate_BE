import AuthService from '@services/auth.service';

class AuthController {
  public authService = new AuthService();

  // public register = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userData: RegisterUserDto = req.body;
  //     const userResponse = await this.authService.register(userData);
  //     //res.setHeader('Set-Cookie', [cookie]);
  //     AppResponseHelper.sendSuccess(res, 'Success', userResponse);
  //   }
  //   catch (ex) {
  //     next(ex)
  //   }
  // };

  // public logIn = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userData: LoginDto = req.body;
  //     const tokenInfo = await this.authService.login(userData);

  //     AppResponseHelper.sendSuccess(res, 'Success', tokenInfo);
  //   }
  //   catch (ex) {
  //     next(ex)
  //   }
  // };

  // public profile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  //   try {
  //     const user = req.user;
  //     const profileInfo = await this.authService.profile(user.id);


  //     AppResponseHelper.sendSuccess(res, 'Success', profileInfo);
  //   }
  //   catch (ex) {
  //     next(ex)
  //   }
  // };

  // public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<{ message: string } | void> => {

  //   try {
  //     const email: string = req.body.email.toLowerCase()

  //     const userExist = await this.authService.findUserByEmail(email)
  //     if (!userExist) {
  //       throw new BadRequestException(`User does not exists, please try again!`);
  //     }
  //     if (userExist.isDeleted || !userExist.isActive) {
  //       throw new BadRequestException(`User does not exists, please try again!`);
  //     }

  //     const resetOperation = await this.authService.forgotPassword(userExist)

  //     AppResponseHelper.sendSuccess(res, 'Success', resetOperation);

  //   } catch (ex) {
  //     next(ex)
  //   }

  // }

  // /**
  //  * This will take resetToken and userId and perform reset password operation
  //  */
  // public resetPasswordByToken = async (req: Request, res: Response, next: NextFunction) => {
  //   try {

  //     let result = await this.authService.resetPasswordByToken(req.body)
  //     AppResponseHelper.sendSuccess(res, 'Success', result);


  //   } catch (ex) {
  //     next(ex)
  //   }
  // }

  // /**
  //  * This API is called when user want to update his existing password. This assumes he already knows his old password.
  //  */
  // public updatePassword = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  //   try {
  //     const userId = req.user.id;

  //     const result = await this.authService.updatePassword(userId, req.body)

  //     AppResponseHelper.sendSuccess(res, 'Success', result);

  //   } catch (ex) {
  //     next(ex)
  //   }
  // }

  // public getUserFromForgotToken = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const token = req.query.token as string
  //     const result = await this.authService.getUserFromForgotToken(token)
  //     AppResponseHelper.sendSuccess(res, 'Success', result ?.userData);
  //   } catch (ex) {
  //     next(ex)
  //   }

  // }

  // /**
  //  * In this API we simply fetch jwt token from headers -> delete that particular session from cache.
  //  */
  // public logout = async (req: Request, res: Response, next: NextFunction) => {
  //   try {

  //     const authToken = req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null;
  //     const result = await this.authService.logout(authToken)

  //     AppResponseHelper.sendSuccess(res, 'Logged out successfully.', result);

  //   } catch (ex) {
  //     next(ex)
  //   }
  // }

}

export default AuthController;
