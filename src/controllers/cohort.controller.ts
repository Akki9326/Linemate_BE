import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { CohortService } from '@/services/cohort.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Response } from 'express-serve-static-core';

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
}

export default CohortController;
