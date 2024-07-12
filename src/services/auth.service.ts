import { OTP_EXPIRY, SECRET_KEY, SESSION_EXPIRY_MINS, TOKEN_EXPIRY } from '@/config';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { ForgotPasswordDto, LoginOTPDto, ResetPasswordDto } from '@/models/dtos/login.dto';
import { AppPermission } from '@/models/enums/app-access.enum';
import { TokenTypes } from '@/models/enums/tokenType';
import { LoginResponseData, TokenData } from '@/models/interfaces/auth.interface';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { AppMessages } from '@/utils/helpers/app-message.helper';
import { UserCaching } from '@/utils/helpers/caching-user.helper';
import { ExpiryTime } from '@/utils/helpers/expiry-time.helper';
import { PasswordHelper } from '@/utils/helpers/password.helper';
import { Email } from '@/utils/services/email';
import { EmailSubjects, EmailTemplates } from '@/utils/templates/email-template.transaction';
import DB from '@databases';
import { generateOtp } from '@utils/util';
import { addMinutes } from 'date-fns';
import JWT from 'jsonwebtoken';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { RoleService } from './role.service';
import { TenantService } from './tenant.service';

export default class AuthService {
	private users = DB.Users;
	private userToken = DB.UserToken;
	private userPasswordModel = DB.UserPassword;
	private roleService = new RoleService();
	private tenantService = new TenantService();

	constructor() {}

	public async findUserByContactInfo(username: string, isActive: boolean) {
		if (!username) {
			throw new BadRequestException(AppMessages.emptyUsername);
		}
		const user = await this.users.findOne({
			where: {
				[Op.and]: [
					{ isActive: isActive, isLocked: false, isDeleted: false },
					{
						[Op.or]: [{ email: username }, { mobileNumber: username }],
					},
				],
			},
		});

		return user;
	}
	private async saveTokenInDB(userId: number, tokenType: TokenTypes, token: string) {
		const existingUserTokens = await this.userToken.findAll({
			where: {
				userId: userId,
				isActive: true,
				tokenType: tokenType,
			},
		});

		if (existingUserTokens && existingUserTokens.length) {
			await Promise.all(
				existingUserTokens.map(async tokenInstance => {
					tokenInstance.isActive = false;
					await tokenInstance.save();
				}),
			);
		}

		const userToken = new this.userToken();
		userToken.token = token;
		userToken.tokenType = tokenType;
		userToken.userId = userId;
		userToken.expiresAt = addMinutes(new Date(), parseInt(OTP_EXPIRY));
		userToken.isActive = true;
		await userToken.save();

		return {
			tokenId: userToken.id,
			expiresAt: userToken.expiresAt,
		};
	}
	private createToken(tokenRawData: JwtTokenData): TokenData {
		const secretKey: string = SECRET_KEY;
		const expiresIn: number = parseInt(TOKEN_EXPIRY);

		return { expiresIn, token: JWT.sign(tokenRawData, secretKey, { expiresIn }) };
	}
	private async triggerLoginOTPs(user, otp: string) {
		const emailSubject = await EmailSubjects.resetPasswordEmailSubject;
		const emailBody = EmailTemplates.resetPasswordEmail(user.firstName, user.email, otp);
		await Email.sendEmail(user.email, emailSubject, emailBody);
	}
	public async loginUser(loginOTPDto: LoginOTPDto): Promise<LoginResponseData> {
		const user = await this.findUserByContactInfo(loginOTPDto.username, true);
		if (!user) {
			throw new BadRequestException(AppMessages.invalidUsername);
		}
		const isValid = user.validatePassword(loginOTPDto.password);

		if (!isValid) {
			await this.incrementFailedLoginAttempts(user);
			throw new BadRequestException(AppMessages.invalidPassword);
		}

		if (!user.isActive) {
			throw new BadRequestException(AppMessages.inactiveUser);
		}

		if (user.isLocked) {
			throw new BadRequestException(AppMessages.lockedUser);
		}

		if (user.failedLoginAttempts >= 5) {
			user.isLocked = true;
			await user.save();
			throw new BadRequestException(AppMessages.accountLocked);
		}
		const getActiveSessions = await UserCaching.getActiveSessions(user.email);

		const sessionId: string = uuidv4();

		const userToken = this.createToken({
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			id: user.id,
			sessionId,
			userType: user.userType,
		});
		let tenantDetails = [];
		if (user.tenantIds && user.tenantIds.length > 0) {
			tenantDetails = await Promise.all(
				user.tenantIds.map(async tenantId => {
					return await this.tenantService.one(tenantId);
				}),
			);
		}
		const loginResponse: LoginResponseData = {
			userData: {
				access: (await this.roleService.getAccessByRoleIds(user.id)) as AppPermission[],
				email: user.email,
				mobileNumber: user.mobileNumber,
				firstName: user.firstName,
				lastName: user.lastName,
				countryCode: user.countryCode,
				tenantIds: tenantDetails,
				isTemporaryPassword: user.isTemporaryPassword,
			},
			token: userToken.token,
		};

		await this.updateSuccessfulLogin(user);
		getActiveSessions.push({
			sessionId,
			expiry: ExpiryTime.sessionExpiry(+SESSION_EXPIRY_MINS),
		});

		UserCaching.pushSession(user.email, getActiveSessions);
		return loginResponse;
	}
	private async incrementFailedLoginAttempts(user: any): Promise<void> {
		user.failedLoginAttempts += 1;
		await user.save();
	}
	private async updateSuccessfulLogin(user: any): Promise<void> {
		user.lastLoggedInAt = new Date();
		user.failedLoginAttempts = 0;
		await user.save();
	}
	public async sendResetPasswordOTP(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
		const otp = generateOtp().toString();
		const user = await this.findUserByContactInfo(forgotPasswordDto.username, true);
		if (!user) {
			throw new BadRequestException(AppMessages.invalidUsername);
		}
		await this.saveTokenInDB(user.id, TokenTypes.FORGOT_PASSWORD, otp);
		await this.triggerLoginOTPs(user, otp);
	}
	public async verifyOtp(otp: string): Promise<{ email: string }> {
		const userToken = await this.userToken.findOne({
			where: {
				isActive: true,
				tokenType: TokenTypes.FORGOT_PASSWORD,
				token: otp,
			},
		});
		if (!userToken || userToken.expiresAt < new Date()) {
			throw new BadRequestException(AppMessages.expiredOtp);
		}
		const userDetails = await this.users.findOne({ where: { id: userToken.userId, isActive: true, isDeleted: false } });
		if (!userDetails) {
			throw new BadRequestException(AppMessages.userNotFound);
		}
		return {
			email: userDetails.email,
		};
	}
	public async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ email: string }> {
		const userToken = await this.userToken.findOne({
			where: {
				isActive: true,
				tokenType: TokenTypes.FORGOT_PASSWORD,
				token: resetPasswordDto.otp,
			},
		});

		if (!userToken || userToken.expiresAt < new Date()) {
			throw new BadRequestException(AppMessages.expiredOtp);
		}

		const user = await this.users.findOne({
			where: { id: userToken.userId, isActive: true, isDeleted: false },
		});
		if (!user) {
			throw new BadRequestException(AppMessages.userNotFound);
		}

		const userPasswords = await this.userPasswordModel.findAll({
			where: { userId: user.id.toString() }, // Ensure userId is treated as a string
			order: [['createdAt', 'DESC']],
			limit: 5,
		});

		const hashedPassword = PasswordHelper.hashPassword(resetPasswordDto.password);

		for (const userPassword of userPasswords) {
			if (PasswordHelper.validatePassword(resetPasswordDto.password, userPassword.password)) {
				throw new BadRequestException(AppMessages.passwordReused);
			}
		}
		user.password = hashedPassword;
		user.isTemporaryPassword = false;
		userToken.isActive = false;

		await this.userPasswordModel.create({
			userId: user.id.toString(), // Ensure userId is treated as a string
			password: hashedPassword,
		});

		await user.save();
		await userToken.save();

		return { email: user.email };
	}
}
