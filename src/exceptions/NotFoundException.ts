import { HttpStatusCode } from '@/models/enums/http-status-code.enum';
import { HttpException } from './HttpException';

export class NotFoundException extends HttpException {
  constructor(public message: string, public data?: any) {
    super(HttpStatusCode.NOT_FOUND, message, data);
  }
}
