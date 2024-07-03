import PermissionController from '@/controllers/permissions.controller';
import { PermissionDto } from '@/models/dtos/permissions.dto';

import { Routes } from '@/models/interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { Router } from 'express';


class PermissionRoute implements Routes {
  public path = '/permission';
  public router = Router();
  public permissionController = new PermissionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/v1/add`, validationMiddleware(PermissionDto, 'body'), this.permissionController.create);
    this.router.put(`${this.path}/v1/:id`,validationMiddleware(PermissionDto, 'body'), this.permissionController.update);
    this.router.get(`${this.path}/v1/:id`, this.permissionController.getById);
    this.router.post(`${this.path}/v1/list`, this.permissionController.list);
    this.router.delete(`${this.path}/v1/:id`, this.permissionController.delete);

  }
}

export default PermissionRoute;
