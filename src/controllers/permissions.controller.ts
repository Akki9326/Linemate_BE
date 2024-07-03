import { PermissionListRequestDto } from '@/models/dtos/permissions-list.dto';
import { PermissionDto } from '@/models/dtos/permissions.dto';
import PermissionServices from '@/services/permission.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class PermissionController {
  public permissionServices = new PermissionServices();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permission: PermissionDto = req.body;
      const permissionResponse = await this.permissionServices.add(permission);
      AppResponseHelper.sendSuccess(res, 'Success', permissionResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permission: PermissionDto = req.body;
      const permissionId = parseInt(req.params.id)
      const permissionResponse = await this.permissionServices.update(permission,permissionId);
      AppResponseHelper.sendSuccess(res, 'Success', permissionResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permissionId = parseInt(req.params.id)
      const permissionResponse = await this.permissionServices.one(permissionId);
      AppResponseHelper.sendSuccess(res, 'Success', permissionResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
    public list = async (req: Request, res: Response, next: NextFunction) => {
    try {
     const pageModel = req.body as PermissionListRequestDto; // Provide the missing type argument
     const permissionResponse = await this.permissionServices.all(pageModel);
      AppResponseHelper.sendSuccess(res, 'Success', permissionResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
    public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
       const permissionId = parseInt(req.params.id)
      const permissionResponse = await this.permissionServices.remove(permissionId);
      AppResponseHelper.sendSuccess(res, 'Success', permissionResponse);
    }
    catch (ex) {
      next(ex)
    }
  };



}

export default PermissionController;
