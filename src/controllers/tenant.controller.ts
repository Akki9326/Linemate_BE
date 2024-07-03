import { ListRequestDto } from '@/models/dtos/list-request.dto';
import { TanantDto } from '@/models/dtos/tenant.dto';
import { TanantService } from '@/services/tenant.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class TanantController {
  public tanantService = new TanantService();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tanantDetails: TanantDto = req.body;
      const tanant = await this.tanantService.add(tanantDetails);
      AppResponseHelper.sendSuccess(res, 'Success', tanant);
    }
    catch (ex) {
      next(ex)
    }
  };
  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = parseInt(req.params.id)
      const tenantResponse = await this.tanantService.one(tenantId);
      AppResponseHelper.sendSuccess(res, 'Success', tenantResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
  public list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let pageModel = req.query
      const tenantResponse = await this.tanantService.list(pageModel);
      AppResponseHelper.sendSuccess(res, 'Success', tenantResponse);
    }
    catch (ex) {
      next(ex)
    }
  };
}

export default TanantController;
