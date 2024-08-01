import { assessmentDto } from '@/models/dtos/assessment.dto';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import AssessmentServices from '@/services/assessment.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class AssessmentController {
	public AssessmentServices = new AssessmentServices();

	public add = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const assessmentData: assessmentDto = req.body;
			const user = req.user as JwtTokenData;
			const assessmentResponse = await this.AssessmentServices.add(assessmentData, user);
			AppResponseHelper.sendSuccess(res, 'Success', assessmentResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const assessmentId = parseInt(req.params.id);
			const validateData: assessmentDto = req.body;
			const updatedBy = req.user as JwtTokenData;
			const assessmentResponse = await this.AssessmentServices.update(validateData, assessmentId, updatedBy);
			AppResponseHelper.sendSuccess(res, 'Success', assessmentResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public one = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const assessmentId = parseInt(req.params.id);
			const assessmentResponse = await this.AssessmentServices.one(assessmentId);
			AppResponseHelper.sendSuccess(res, 'Success', assessmentResponse);
		} catch (ex) {
			next(ex);
		}
	};
	// public delete = async (req: RequestWithUser, res: Response, next: NextFunction) => {
	// 	try {
	// 		const variableId = parseInt(req.params.id);
	// 		const userId: number = req.user.id;
	// 		const variableResponse = await this.AssessmentServices.delete(variableId, userId);
	// 		AppResponseHelper.sendSuccess(res, 'Success', variableResponse);
	// 	} catch (ex) {
	// 		next(ex);
	// 	}
	// };
	// public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
	// 	try {
	// 		const pageModel = req.body as variableListDto;
	// 		const tenantId = req.tenantId as number;
	// 		const variableResponse = await this.AssessmentServices.all(pageModel, tenantId);
	// 		AppResponseHelper.sendSuccess(res, 'Success', variableResponse);
	// 	} catch (ex) {
	// 		next(ex);
	// 	}
	// };
	// public getUserVariable = async (req: Request, res: Response, next: NextFunction) => {
	// 	try {
	// 		const userId = parseInt(req.params.userId);
	// 		const tenantId = req.body.tenantId as number;
	// 		const userResponse = await this.AssessmentServices.getVariableDetails(userId, tenantId);
	// 		AppResponseHelper.sendSuccess(res, 'Success', userResponse);
	// 	} catch (ex) {
	// 		next(ex);
	// 	}
	// };
}

export default AssessmentController;
