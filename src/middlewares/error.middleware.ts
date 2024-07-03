import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@/utils/services/logger';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { HttpStatusCode } from '@/models/enums/http-status-code.enum';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || HttpStatusCode.SERVER_ERROR;
    const message: string = error.message || 'Something went wrong';

    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    AppResponseHelper.sendError(res, status, message, error.data);
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
