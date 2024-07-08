import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@/utils/services/logger';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { HttpStatusCode } from '@/models/enums/http-status-code.enum';

const errorMiddleware = (error: HttpException | Error, req: Request, res: Response, next: NextFunction) => {
  try {
    const commonErrorMessage = 'Something went wrong'
    const status = error.status || HttpStatusCode.SERVER_ERROR;
    let message = error.message || commonErrorMessage
    let data  = error.data || null
    if (error instanceof HttpException) {
      logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}${data ? `, Data:: ${JSON.stringify(data)}` : ''}${error && error.stack ? `, Location: ${JSON.stringify(error.stack)}` : ''}`);
    } else {
      message = commonErrorMessage
      logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${JSON.stringify(error)}. Location: ${JSON.stringify(error.stack)}`);
    }
    AppResponseHelper.sendError(res, status, message, error.data);
  } catch (internalError) {
    next(internalError);
  }
};

export default errorMiddleware;