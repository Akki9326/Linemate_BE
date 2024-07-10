import UserController from '@/controllers/user.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import headerMiddleware from '@/middlewares/header.middleWare';
import { UpdatePasswordDto } from '@/models/dtos/update-password.dto';
import { UserDto } from '@/models/dtos/user.dto';
import { Routes } from '@/models/interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { Router } from 'express';


class UserRoute implements Routes {
  public path = '/user';
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/v1/add`, validationMiddleware(UserDto, 'body'), authMiddleware, this.userController.add);
    this.router.put(`${this.path}/v1/:id`, validationMiddleware(UserDto, 'body'), authMiddleware, this.userController.update);
    this.router.post(`${this.path}/v1/list`, authMiddleware,headerMiddleware, this.userController.list);
    this.router.get(`${this.path}/v1/:id`, authMiddleware,headerMiddleware, this.userController.one);
    this.router.delete(`${this.path}/v1/delete-users`, authMiddleware, this.userController.delete);
    this.router.post(`${this.path}/v1/de-active`, authMiddleware, this.userController.deActiveUser);
    this.router.post(`${this.path}/v1/:id/variable`, authMiddleware, this.userController.getVariable);
    this.router.post(`${this.path}/v1/:id/change-password`, validationMiddleware(UpdatePasswordDto,'body'), authMiddleware, this.userController.changePassword);
  }
}

export default UserRoute;
