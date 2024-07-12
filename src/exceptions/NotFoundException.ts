import { HttpStatusCode } from '@/models/enums/http-status-code.enum';
import { HttpException } from './HttpException';

export class NotFoundException extends HttpException {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(public message: string, public data?: any) {
		super(HttpStatusCode.NOT_FOUND, message, data);
	}
}
