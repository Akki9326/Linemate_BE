import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { RoleService } from '@/services/role.service';
import { UserCaching } from '@/utils/helpers/caching-user.helper';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {

    const Authorization = req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null;
    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = verify(Authorization, secretKey) as JwtTokenData;
      const emailId = verificationResponse.email;

      //We validate token by session id existence and its expiry time
      const isValidSession = await UserCaching.isValidSession(verificationResponse.email, verificationResponse.sessionId)


      if (!isValidSession) next(new HttpException(401, 'Invalid session.'));

      if (!emailId) {
        next(new HttpException(401, 'Invalid authentication token'));
      } else {
        req.user = verificationResponse;
        req.userAccess = await new RoleService().getAccessByRoleIds(req.user.roleIds);
        next();
      }
    } else {
      next(new HttpException(401, 'Unauthorized access'));
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default authMiddleware;
