import { HttpStatusCode } from '@/models/enums/http-status-code.enum';
import { HttpException } from './HttpException';

export class UnauthorizedException extends HttpException {
	constructor(public message: string, public data?: any) {
		super(HttpStatusCode.UNAUTHORIZED, message, data);
	}
}
