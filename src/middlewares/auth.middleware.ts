import { AppPermission } from '@/models/enums/app-access.enum';
import { HttpStatusCode } from '@/models/enums/http-status-code.enum';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { RoleService } from '@/services/role.service';
import { UserCaching } from '@/utils/helpers/caching-user.helper';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {

    const Authorization = req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null;
    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = verify(Authorization, secretKey) as JwtTokenData;
      const emailId = verificationResponse.email;

      const isValidSession = await UserCaching.isValidSession(verificationResponse.email, verificationResponse.sessionId)


      if (!isValidSession) next(new HttpException(401, 'Invalid session.'));

      if (!emailId) {
        next(new HttpException(HttpStatusCode.UNAUTHORIZED, 'Invalid authentication token'));
      } else {
        req.user = verificationResponse;
        req.userAccess  =  await new RoleService().getAccessByRoleIds(req.user.id) as AppPermission[]
        next();
      }
    } else {
      next(new HttpException(HttpStatusCode.UNAUTHORIZED, 'Unauthorized access'));
    }
  } catch (error) {
    next(new HttpException(HttpStatusCode.UNAUTHORIZED, 'Wrong authentication token'));
  }
};

export default authMiddleware;
