import { HttpStatusCode } from '../models/enums/http-status-code.enum';
import { HttpException } from './HttpException';

export class ForbiddenException extends HttpException {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(public message: string, public data?: any) {
		super(HttpStatusCode.FORBIDDEN, message, data);
	}
}
