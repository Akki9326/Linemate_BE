import { HttpStatusCode } from '@/models/enums/http-status-code.enum';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { UserCaching } from '@/utils/helpers/caching-user.helper';
import { MOBILE_SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';

const mobileAuthMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
	try {
		const Authorization = req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null;
		if (Authorization) {
			const secretKey: string = MOBILE_SECRET_KEY;
			const verificationResponse = verify(Authorization, secretKey) as JwtTokenData;

			const isValidSession = await UserCaching.isValidSession(
				verificationResponse.email || verificationResponse.mobileNumber,
				verificationResponse.sessionId,
			);

			if (!isValidSession) next(new HttpException(401, 'Invalid session.'));

			if (!verificationResponse.email && !verificationResponse.mobileNumber) {
				next(new HttpException(HttpStatusCode.UNAUTHORIZED, 'Invalid authentication token'));
			} else {
				req.user = verificationResponse;
				next();
			}
		} else {
			next(new HttpException(HttpStatusCode.UNAUTHORIZED, 'Unauthorized access'));
		}
	} catch (error) {
		next(new HttpException(HttpStatusCode.UNAUTHORIZED, 'Wrong authentication token'));
	}
};

export default mobileAuthMiddleware;
