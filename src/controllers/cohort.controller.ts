import { CohortListDto } from '@/models/dtos/cohort-list.dto';
import { AssignCohort, CohortDto } from '@/models/dtos/cohort.dto';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { CohortService } from '@/services/cohort.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Response, Request } from 'express-serve-static-core';

class CohortController {
	public cohortService = new CohortService();
	public ruleOptions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const tenantId = req.tenantId as number;
			const cohortResponse = await this.cohortService.ruleOptions(tenantId);
			AppResponseHelper.sendSuccess(res, 'Success', cohortResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public add = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const cohortDetails = req.body as CohortDto;
			const userId = req.user.id as number;
			const cohortResponse = await this.cohortService.add(cohortDetails, userId);
			AppResponseHelper.sendSuccess(res, 'Success', cohortResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const cohortDetails = req.body as CohortDto;
			const cohortId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const cohortResponse = await this.cohortService.update(cohortDetails, cohortId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', cohortResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const cohortId = parseInt(req.params.id);
			const cohortResponse = await this.cohortService.one(cohortId);
			AppResponseHelper.sendSuccess(res, 'Success', cohortResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public delete = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const cohortId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const cohortResponse = await this.cohortService.remove(cohortId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', cohortResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const pageModel = req.body as CohortListDto; // Provide the missing type argument
			const tenantId = req.tenantId as number;
			const cohortResponse = await this.cohortService.all(pageModel, tenantId);
			AppResponseHelper.sendSuccess(res, 'Success', cohortResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public assignMultiCohort = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const assignCohortBody = req.body as AssignCohort;
			const userId = req.user.id as number;
			const cohortResponse = await this.cohortService.assignMultiCohort(assignCohortBody, userId);
			AppResponseHelper.sendSuccess(res, 'Success', cohortResponse);
		} catch (ex) {
			next(ex);
		}
	};
}

export default CohortController;
