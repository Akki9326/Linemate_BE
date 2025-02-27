import { VariableDto } from '@/models/dtos/variable.dto';
import { variableListDto } from '@/models/dtos/varible-list.dto';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import VariableServices from '@/services/variable.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class VariableController {
	public variableServices = new VariableServices();

	public add = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const variableData: VariableDto = req.body;
			const user = req.user as JwtTokenData;
			const variableResponse = await this.variableServices.add(variableData, user);
			AppResponseHelper.sendSuccess(res, 'Success', variableResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public one = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const variableId = parseInt(req.params.id);
			const variableResponse = await this.variableServices.one(variableId);
			AppResponseHelper.sendSuccess(res, 'Success', variableResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public delete = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const variableId = parseInt(req.params.id);
			const userId: number = req.user.id;
			const variableResponse = await this.variableServices.delete(variableId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', variableResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const variableId = parseInt(req.params.id);
			const validateData: VariableDto = req.body;
			const updatedBy = req.user as JwtTokenData;
			const variableResponse = await this.variableServices.update(validateData, variableId, updatedBy);
			AppResponseHelper.sendSuccess(res, 'Success', variableResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const pageModel = req.body as variableListDto;
			const tenantId = req.tenantId as number;
			const variableResponse = await this.variableServices.all(pageModel, tenantId);
			AppResponseHelper.sendSuccess(res, 'Success', variableResponse);
		} catch (ex) {
			next(ex);
		}
	};
}

export default VariableController;
