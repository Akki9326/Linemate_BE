import { HttpStatusCode } from '@/models/enums/http-status-code.enum';
import { HttpException } from './HttpException';

export class ServerException extends HttpException {
  constructor(public message: string, public data?: any) {
    super(HttpStatusCode.SERVER_ERROR, message, data);
  }
}
