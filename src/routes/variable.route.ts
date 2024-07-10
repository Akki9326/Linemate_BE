import UserController from '@/controllers/user.controller';
import VariableController from '@/controllers/variable.controller';
import { accessMiddleWare } from '@/middlewares/access.middlerware';
import authMiddleware from '@/middlewares/auth.middleware';
import headerMiddleware from '@/middlewares/header.middleWare';
import { UserDto } from '@/models/dtos/user.dto';
import { VariableDto } from '@/models/dtos/variable.dto';
import { AppPermission } from '@/models/enums/app-access.enum';
import { Routes } from '@/models/interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { Router } from 'express';


class VariableRoute implements Routes {
  public path = '/variable';
  public router = Router();
  public variableController = new VariableController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/v1/add`, validationMiddleware(VariableDto, 'body'), authMiddleware,headerMiddleware, this.variableController.add);
    this.router.put(`${this.path}/v1/:id`, validationMiddleware(VariableDto, 'body'), authMiddleware,headerMiddleware, this.variableController.update);
    this.router.post(`${this.path}/v1/list`, authMiddleware,headerMiddleware,  this.variableController.list);
    this.router.get(`${this.path}/v1/:id`, authMiddleware, this.variableController.one);
    this.router.delete(`${this.path}/v1/:id`, authMiddleware, this.variableController.delete);
  }
}

export default VariableRoute;
