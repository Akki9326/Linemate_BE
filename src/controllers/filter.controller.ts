import { FilterFor } from '@/models/enums/filter.enum';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { FilterService } from '@/services/filter.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Response } from 'express-serve-static-core';

class FilterController {
	public filterService = new FilterService();

	public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const tenantId = req.tenantId as number;
			const filterFor = req.query.filterFor as FilterFor;
			const filtersResponse = await this.filterService.list(tenantId, filterFor);
			AppResponseHelper.sendSuccess(res, 'Success', filtersResponse);
		} catch (ex) {
			next(ex);
		}
	};
}

export default FilterController;
