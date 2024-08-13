import { TenantListRequestDto } from '@/models/dtos/tenant-list.dto';
import { TenantDto } from '@/models/dtos/tenant.dto';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { TenantService } from '@/services/tenant.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class TenantController {
	public tenantService = new TenantService();

	public create = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const tenantDetails: TenantDto = req.body;
			const userId = req.user.id as number;
			const tenant = await this.tenantService.add(tenantDetails, userId);
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
	public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const pageModel: TenantListRequestDto = req.body;
			const userId = req.user.id as number;
			const tenantResponse = await this.tenantService.list(pageModel, userId);
			AppResponseHelper.sendSuccess(res, 'Success', tenantResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public deleteById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const tenantId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const tenantResponse = await this.tenantService.delete(tenantId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', tenantResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public updateById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const tenantId = parseInt(req.params.id);
			const updateObj: TenantDto = req.body;
			const userId = req.user.id as number;
			const tenantResponse = await this.tenantService.update(tenantId, updateObj, userId);
			AppResponseHelper.sendSuccess(res, 'Success', tenantResponse);
		} catch (ex) {
			next(ex);
		}
	};
}

export default TenantController;
