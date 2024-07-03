import UserTypeController from '@/controllers/userType.controller';
import { userTypeDto } from '@/models/dtos/userType.dto';
import { Routes } from '@/models/interfaces/routes.interface';
import AuthController from '@controllers/auth.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { Router } from 'express';


class UserTypeRoute implements Routes {
  public path = '/user-type';
  public router = Router();
  public userTypeController = new UserTypeController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/v1/add`, validationMiddleware(userTypeDto, 'body'), this.userTypeController.create);
  }
}

export default UserTypeRoute;
