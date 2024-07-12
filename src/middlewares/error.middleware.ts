import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@/utils/services/logger';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { HttpStatusCode } from '@/models/enums/http-status-code.enum';

const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
	try {
		const commonErrorMessage = 'Something went wrong';
		if (error instanceof HttpException) {
			const status = error.status || HttpStatusCode.SERVER_ERROR;
			const message = error.message || commonErrorMessage;
			const data = error.data || null;
			logger.error(
				`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}${data ? `, Data:: ${JSON.stringify(data)}` : ''}${
					error && error.stack ? `, Location: ${JSON.stringify(error.stack)}` : ''
				}`,
			);
			AppResponseHelper.sendError(res, status, message, error.data);
		} else {
			logger.error(
				`[${req.method}] ${req.path} >> StatusCode:: ${HttpStatusCode.SERVER_ERROR}, Message:: ${JSON.stringify(error)}. Location: ${JSON.stringify(
					error.stack,
				)}`,
			);
			AppResponseHelper.sendError(res, HttpStatusCode.SERVER_ERROR, commonErrorMessage, error.message);
		}
	} catch (internalError) {
		next(internalError);
	}
};

export default errorMiddleware;
