import { BadRequestException } from '@/exceptions/BadRequestException';
import { NotFoundException } from '@/exceptions/NotFoundException';
import { TenantModel } from '@/models/db/tenant.model';
import { ResetPasswordTokenModel } from '@/models/db/reset-password-token.model';
import { RoleModel } from '@/models/db/role.model';
import { UserModel } from '@/models/db/users.model';
import { LoginDto } from '@/models/dtos/login.dto';
import { RegisterUserDto } from '@/models/dtos/register-user.dto';
import { ResetPasswordByTokenDto } from '@/models/dtos/reset-password.dto';
import { UpdatePasswordDto } from '@/models/dtos/update-password.dto';
import { TokenData } from '@/models/interfaces/auth.interface';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { UserProfile } from '@/models/interfaces/profile.interface';
import { User } from '@/models/interfaces/users.interface';
import { AppMessages } from '@/utils/helpers/app-message.helper';
import { UserCaching } from '@/utils/helpers/caching-user.helper';
import { ExpiryTime } from '@/utils/helpers/expiry-time.helper';
import { PasswordHelper } from '@/utils/helpers/password.helper';
import { TokenGenerator } from '@/utils/helpers/token-generator.helper';
import { TokenValidator } from '@/utils/helpers/token-validator.helper';
import { UrlHelper } from '@/utils/helpers/url.helper';
import { EmailSubjects, EmailTemplates } from '@/utils/templates/email-template.transaction';
import { FORGOT_PASSWORD_LINK_EXP, MAX_SESSION_COUNT, SECRET_KEY, SESSION_EXPIRY_MINS } from '@config';
import DB from '@databases';
import { isEmpty } from '@utils/util';
import JWT, { verify } from 'jsonwebtoken';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Email } from '../utils/services/email';
import { RoleService } from './role.service';

class AuthService {
  private users = DB.Users;
  private resetPasswordToken = DB.ResetPasswordToken;
  private roleService: RoleService;


  constructor() {
    this.roleService = new RoleService();
  }
  // public async register(userData: RegisterUserDto, createdBy: string = 'System'): Promise<number> {
  //   if (isEmpty(userData)) throw new BadRequestException('Invalid Request', userData)


  //   const findUser: User = await this.users.findOne({ where: { email: userData.email } });
  //   if (findUser) throw new BadRequestException(`Email ${userData.email} already exists`);

  //   userData.password = PasswordHelper.hashPassword(userData.password);

  //   const orgs = await DB.Organisation.findAll({
  //     where: {
  //       id: {
  //         [Op.in]: userData.organisationIds
  //       }
  //     }
  //   });

  //   const createUserData: User = await this.users.create({ ...userData, createdBy });


  //   const userRoles = userData.roleIds.map(async (roleId) => {
  //     const userRole = await DB.UserRoles.create({
  //       userId: createUserData.id,
  //       roleId: roleId,
  //       createdBy
  //     });
  //     return userRole;
  //   });

  //   await Promise.all(userRoles);
  //   return createUserData.id;
  // }

  // public async login(loginDto: LoginDto): Promise<TokenData> {

  //   const user: UserModel = await this.users.findOne({
  //     where: {
  //       email: { [Op.iLike]: loginDto.username }
  //     },
  //     include: [
  //       {
  //         model: RoleModel,
  //         attributes: ['name', 'id', 'isActive'],
  //         through: { attributes: [] },
  //         as: 'roles'
  //       },
  //       {
  //         model: OrganisationModel,
  //         attributes: ['name', 'id', 'isActive'],
  //         as: 'organisation'
  //       },

  //     ]
  //   });

  //   if (!user || !user.isActive || user.isDeleted)
  //     throw new BadRequestException('Invalid Email Address');

  //   //if (user.organisation!user.organisation?.isActive)
  //   // throw new BadRequestException('Organisation is not active');

  //   if (!user.validatePassword(loginDto.password)) {
  //     user.failedLoginAttempts++;
  //     await user.save();

  //     throw new BadRequestException('Invalid Credentials');
  //   }

  //   user.lastLoggedInAt = new Date();
  //   await user.save();

  //   //Check active session limit reached or not 
  //   let getActiveSessions = await UserCaching.getActiveSessions(user.email);

  //   if (getActiveSessions?.length > parseInt(MAX_SESSION_COUNT)) {
  //     throw new BadRequestException("Maximum active sessions count exceeded.")
  //   };

  //   //Go ahead and generate a session
  //   const sessionId: string = uuidv4();

  //   const token = this.createToken({
  //     roleIds: user.roles.filter(r => r.isActive).map(r => r.id),
  //     email: user.email,
  //     username: user.email,
  //     sessionId,
  //     id: user.id,
  //     userType: user.userType,
  //     orgId: user.organisationId
  //   });

  //   //push newly generated session to active sessions
  //   getActiveSessions.push({
  //     sessionId,
  //     expiry: ExpiryTime.sessionExpiry(+SESSION_EXPIRY_MINS)
  //   })

  //   UserCaching.pushSession(user.email, getActiveSessions);

  //   return token;
  // }

  // public async profile(id: number): Promise<UserProfile> {

  //   const user: UserModel = await this.users.findOne({
  //     where: {
  //       id: id,
  //       isDeleted: false
  //     },
  //     attributes: ['firstName', 'lastName', 'email', 'id', 'mobileNumber', 'username', 'userType'],
  //     include: [{
  //       model: OrganisationModel,
  //       attributes: ['name', 'id', 'isActive'],
  //       as: 'organisation'
  //     },
  //     {
  //       model: RoleModel,
  //       attributes: ['name', 'id', 'isActive'],
  //       through: { attributes: [] },
  //       as: 'roles'
  //     },
  //     ]
  //   });

  //   const userAccess = await this.roleService.getAccessByRoleIds(user.roles.filter(r => r.isActive).map(r => r.id));

  //   const userProfile: UserProfile = {
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //     access: userAccess,
  //     email: user.email,
  //     mobileNumber: user.mobileNumber,
  //     userType: user.userType,
  //     organisation: user.organisation,
  //     roleIds: user.roles.filter(r => r.isActive).map(r => r.id),
  //   }

  //   return userProfile;
  // }

  // private createToken(tokenRawData: JwtTokenData): TokenData {
  //   const secretKey: string = SECRET_KEY;
  //   const expiresIn: number = 60 * 60 * 60 * 24 * 7;

  //   return { expiresIn, token: JWT.sign(tokenRawData, secretKey, { expiresIn }) };
  // }

  // public async findUserByEmail(email: string): Promise<UserModel> {
  //   const findUser: UserModel = await this.users.findOne({
  //     where: {
  //       email: { [Op.iLike]: email }
  //     }
  //   });
  //   return findUser

  // }

  // public async forgotPassword(userExist: UserModel) {

  //   let expireTime = ExpiryTime.forgetPassword(+FORGOT_PASSWORD_LINK_EXP);

  //   const resetToken = await this.saveResetPasswordToken(userExist.id, expireTime);
  //   Email.sendEmail(userExist.email, EmailSubjects.resetPasswordEmail, EmailTemplates.resetPasswordEmail(userExist.firstName, UrlHelper.resetPasswordUrl(resetToken)));

  //   return { message: AppMessages.ForgotPasswordSuccess }

  // }

  // public async saveResetPasswordToken(userId: number, expireTime) {

  //   let resetToken = TokenGenerator.forgetPasswordToken();

  //   //link expires in 10 minutes

  //   const obj_forgetPasswordToken = {
  //     token: resetToken,
  //     userId: userId,
  //     isActive: true,
  //     expireTime: expireTime,
  //     createdBy: "System"
  //   }
  //   //check if already any previous token exists
  //   let tokenExists = await this.resetPasswordToken.findOne({ where: { userId: userId, isActive: true } })
  //   if (tokenExists) {
  //     tokenExists.isActive = false
  //     await tokenExists.save()
  //   }
  //   await this.resetPasswordToken.create(obj_forgetPasswordToken);

  //   return resetToken;

  // }

  // public async resetPasswordByToken(req: ResetPasswordByTokenDto) {
  //   const { newPassword, resetToken, userId, confirmPassword } = req;

  //   let user: UserModel = await this.users.findOne({ where: { id: userId, isActive: true, isDeleted: false } })

  //   if (!user) {
  //     throw new NotFoundException("User not available.")
  //   }

  //   let tokenExists = await this.resetPasswordToken.findOne({ where: { userId, token: resetToken } })


  //   if (!tokenExists) {
  //     throw new NotFoundException("Token for user not found.")
  //   }
  //   TokenValidator.tokenConsumed(tokenExists.isActive)

  //   TokenValidator.tokenExpiry(+tokenExists.expireTime)

  //   TokenValidator.urlChecker(tokenExists.token, resetToken)


  //   //setting new password in users model
  //   let password = PasswordHelper.hashPassword(newPassword);
  //   user.password = password
  //   await user.save()

  //   //updating status of link in token model
  //   tokenExists.isActive = false
  //   await tokenExists.save()

  //   //when password is update we delete all sessions
  //   UserCaching.deleteAllSessions(user.username);

  //   return tokenExists

  // }

  // public async updatePassword(user: number, req: UpdatePasswordDto) {
  //   const { oldPassword, newPassword } = req;

  //   let userExists: UserModel = await this.users.findOne({ where: { id: user, isActive: true, isDeleted: false } })
  //   if (!userExists) {
  //     throw new NotFoundException("User not found.")
  //   }

  //   if (!userExists.validatePassword(oldPassword)) {
  //     throw new BadRequestException('Invalid Credentials');
  //   }

  //   let password = PasswordHelper.hashPassword(newPassword);
  //   userExists.password = password;

  //   await userExists.save()

  //   //when password is update we delete all sessions
  //   UserCaching.deleteAllSessions(userExists.username);

  //   return { success: true }
  // }

  // public async getUserFromForgotToken(token: string): Promise<{ userData: ResetPasswordTokenModel }> {

  //   const whereClause = {
  //     isActive: true,
  //     isDeleted: false
  //   }

  //   const userFromToken: ResetPasswordTokenModel = await this.resetPasswordToken.findOne({
  //     where: { token },
  //     include: {
  //       model: UserModel,
  //       where: whereClause,
  //       attributes: ['email', 'id', 'username', 'firstName', 'lastName', 'mobileNumber'],
  //       as: 'users'
  //     }
  //   });


  //   if (!userFromToken?.dataValues?.users?.dataValues) {
  //     throw new NotFoundException("User not found.")
  //   }

  //   TokenValidator.tokenConsumed(userFromToken?.dataValues?.isActive)


  //   TokenValidator.tokenExpiry(+userFromToken?.dataValues?.expireTime.expireTime)


  //   return { userData: userFromToken.dataValues.users.dataValues };
  // }

  // public async logout(authToken: string) {
  //   const secretKey: string = SECRET_KEY;
  //   const verificationResponse = verify(authToken, secretKey) as JwtTokenData;

  //   //here we delete individual session from cache
  //   const isValidSession = await UserCaching.deleteParticularSession(verificationResponse.username, verificationResponse.sessionId);
  //   return isValidSession
  // }
}

export default AuthService;
