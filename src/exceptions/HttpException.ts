import { HttpStatusCode } from '@/models/enums/http-status-code.enum';

export class HttpException extends Error {
  constructor(public status: HttpStatusCode, public message: string, public data?: any) {
    super(message);
  }
}
