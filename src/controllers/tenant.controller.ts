import { TenantDto } from '@/models/dtos/tenant.dto';
import { TenantService } from '@/services/tenant.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class TenantController {
	public tenantService = new TenantService();

	public create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const tenantDetails: TenantDto = req.body;
			const tenant = await this.tenantService.add(tenantDetails);
			AppResponseHelper.sendSuccess(res, 'Success', tenant);
		} catch (ex) {
			next(ex);
		}
	};
	public getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const tenantId = parseInt(req.params.id);
			const tenantResponse = await this.tenantService.one(tenantId);
			AppResponseHelper.sendSuccess(res, 'Success', tenantResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public list = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const pageModel = req.query;
			const tenantResponse = await this.tenantService.list(pageModel);
			AppResponseHelper.sendSuccess(res, 'Success', tenantResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public deleteById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const tenantId = parseInt(req.params.id);
			const tenantResponse = await this.tenantService.delete(tenantId);
			AppResponseHelper.sendSuccess(res, 'Success', tenantResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public updateById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const tenantId = parseInt(req.params.id);
			const updateObj: TenantDto = req.body;
			const tenantResponse = await this.tenantService.update(tenantId, updateObj);
			AppResponseHelper.sendSuccess(res, 'Success', tenantResponse);
		} catch (ex) {
			next(ex);
		}
	};
}

export default TenantController;
