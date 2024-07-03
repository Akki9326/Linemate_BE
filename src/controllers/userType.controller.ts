import { userTypeDto } from '@/models/dtos/userType.dto';
import UserTypeServices from '@/services/userType.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class UserTypeController {
  public userTypeServices = new UserTypeServices();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userType: userTypeDto = req.body;
      const userResponse = await this.userTypeServices.add(userType);
      AppResponseHelper.sendSuccess(res, 'Success', userResponse);
    }
    catch (ex) {
      next(ex)
    }
  };


}

export default UserTypeController;
