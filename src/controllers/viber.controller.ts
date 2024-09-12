import { RequestWithUser } from '@/models/interfaces/auth.interface';
import VariableServices from '@/services/variable.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { logger } from '@/utils/services/logger';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class ViberController {
	public variableServices = new VariableServices();

	public dlr = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const viberResponse = req.body;
			logger.info(`Received Viber DLR response: ${JSON.stringify(viberResponse)}`, { viberResponse });
			AppResponseHelper.sendSuccess(res, 'Success', {});
		} catch (ex) {
			logger.error(`Error processing Viber DLR response: ${ex.message}`, { error: ex });
			next(ex);
		}
	};

	public incmng = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const viberResponse = req.body;
			logger.info(`Received Viber incoming message: ${JSON.stringify(viberResponse)}`, { viberResponse });
			AppResponseHelper.sendSuccess(res, 'Success', {});
		} catch (ex) {
			logger.error(`Error processing Viber incoming message: ${ex.message}`, { error: ex });
			next(ex);
		}
	};
}

export default ViberController;
