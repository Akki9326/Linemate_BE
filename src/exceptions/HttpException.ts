import { HttpStatusCode } from '@/models/enums/http-status-code.enum';

export class HttpException extends Error {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(public status: HttpStatusCode, public message: string, public data?: any) {
		super(message);
	}
}
