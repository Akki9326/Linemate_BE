import { HttpStatusCode } from '@/models/enums/http-status-code.enum';
import { UserType } from '@/models/enums/user-types.enum';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { HttpException } from '@exceptions/HttpException';
import { NextFunction, Response } from 'express';

const headerMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.header('tenantId') ? req.header('tenantId') : null;
      if(!tenantId) {
        if(req.user.userType !== UserType['ChiefAdmin']){
          next(new HttpException(HttpStatusCode.BAD_REQUEST, 'TenantId is required in header'));
        }
      }else{
         req.tenantId = parseInt(tenantId);
        next();
      }
  } catch (error) {
    next(new HttpException(HttpStatusCode.BAD_REQUEST, error));
  }
};

export default headerMiddleware;
