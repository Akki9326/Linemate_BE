import { HttpStatusCode } from '@/models/enums/http-status-code.enum';
import { HttpException } from './HttpException';

export class BadRequestException extends HttpException {
  constructor(public message: string, public data?: any) {
    super(HttpStatusCode.BAD_REQUEST, message, data);
  }
}
