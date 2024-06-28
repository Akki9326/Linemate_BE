import RoleController from '@/controllers/role.controller';
import { RoleDto } from '@/models/dtos/role.dto';
import { userTypeDto } from '@/models/dtos/userType.dto';
import { Routes } from '@/models/interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { Router } from 'express';


class RoleRoute implements Routes {
  public path = '/role';
  public router = Router();
  public roleController = new RoleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/v1/add`, validationMiddleware(RoleDto, 'body'), this.roleController.create);
    this.router.put(`${this.path}/v1/:id`, validationMiddleware(RoleDto, 'body'), this.roleController.update);
    this.router.get(`${this.path}/v1/:id`, this.roleController.getById);
    this.router.post(`${this.path}/v1/list`, this.roleController.list);
    this.router.delete(`${this.path}/v1/:id`, this.roleController.delete);
  }
}

export default RoleRoute;
