import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@/utils/services/logger';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { HttpStatusCode } from '@/models/enums/http-status-code.enum';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const commonErrorMessage = 'Something went wrong';
    const status: number = error.status || HttpStatusCode.SERVER_ERROR;
    let message: string = error.message || commonErrorMessage;
    const stack = error.stack || '';
    const stackLine = stack.split('\n')[1];
    const errorLocation = stackLine ? stackLine.match(/at\s+(.*)/)?.[1] : 'Location details unavailable';
    if (error.name === 'Error') {
      logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}. Location: ${errorLocation}`);
    } else {
      message = commonErrorMessage;
      logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${JSON.stringify(error)}. Location: ${errorLocation}`);
    }
    AppResponseHelper.sendError(res, status, message, error.data);
  } catch (internalError) {
    next(internalError);
  }
};

export default errorMiddleware;
