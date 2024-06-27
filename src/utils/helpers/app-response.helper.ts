import { HttpStatusCode } from '@/models/enums/http-status-code.enum';
import { AppResponse } from '@/models/interfaces/response.interface';
import { Request, Response, response } from 'express';

export class AppResponseHelper {

  static send(res: Response, responseData: AppResponse<any>) {
    return res.status(responseData.code).json(responseData);
  }

  static sendSuccess(res: Response, message: string, data: any) {
    const resp = {
      data: data,
      success: true,
      code: HttpStatusCode.SUCCESS,
      message: message,
    };

    this.send(res, resp);
  }

  static sendError(res: Response, code: HttpStatusCode, message: string, data: any) {
    const resp = {
      data: data,
      success: false,
      code: code,
      message: message,
    };

    this.send(res, resp);
  }
}
