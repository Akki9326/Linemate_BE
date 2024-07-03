import TanantController from '@/controllers/tenant.controller';
import { accessMiddleWare } from '@/middlewares/access.middulerware';
import authMiddleware from '@/middlewares/auth.middleware';
import { TanantDto } from '@/models/dtos/tenant.dto';
import { AppPermission } from '@/models/enums/app-access.enum';
import { Routes } from '@/models/interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { Router } from 'express';


class RoleRoute implements Routes {
  public path = '/tenant';
  public router = Router();
  public tanantController = new TanantController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/v1/add`, validationMiddleware(TanantDto, 'body'), authMiddleware, accessMiddleWare([AppPermission.AUTH]), this.tanantController.create);
    this.router.get(`${this.path}/v1/list`, this.tanantController.list);
    this.router.get(`${this.path}/v1/:id`, this.tanantController.getById);
  }
}

export default RoleRoute;
