import { UnauthorizedException } from '@/exceptions/UnauthotizedException';
import { AppPermission } from '@/models/enums/app-access.enum';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { NextFunction, Response } from 'express';

export const accessMiddleWare = (access: AppPermission[]) => {
  const accessValidator = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (req.user) {
        if (req.userAccess.some(f => access.some(a => a == f))) {
          next();
        } else {
          next(new UnauthorizedException('Not Allowed'));
        }
      } else {
        next(new UnauthorizedException('Unauthorized access'));
      }
    } catch (error) {
      next(new UnauthorizedException('Wrong access info'));
    }
  };

  return accessValidator;
};

