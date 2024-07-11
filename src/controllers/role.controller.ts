import { RoleDto,RoleListRequestDto } from '@/models/dtos/role.dto';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { RoleService } from '@/services/role.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class RoleController {
  public roleService = new RoleService();

  public add = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const roleDetails: RoleDto = req.body;
      const user= req.user 
      const rolePermission = await this.roleService.add(roleDetails,user);
      AppResponseHelper.sendSuccess(res, 'Success', rolePermission);
    }
    catch (ex) {
      next(ex)
    }
  };
  public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const role: RoleDto = req.body;
      const roleId = parseInt(req.params.id)
      const user= req.user 
      const roleResponse = await this.roleService.update(role, roleId,user);
      AppResponseHelper.sendSuccess(res, 'Success', roleResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = parseInt(req.params.id)
      const roleResponse = await this.roleService.one(roleId);
      AppResponseHelper.sendSuccess(res, 'Success', roleResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pageModel = req.body as RoleListRequestDto; // Provide the missing type argument
      const roleResponse = await this.roleService.all(pageModel);
      AppResponseHelper.sendSuccess(res, 'Success', roleResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
       const roleId = parseInt(req.params.id)
      const roleResponse = await this.roleService.remove(roleId);
      AppResponseHelper.sendSuccess(res, 'Success', roleResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
}

export default RoleController;
