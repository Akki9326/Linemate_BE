import { HttpStatusCode } from '../enums/http-status-code.enum';

export interface AppResponse<T> {
	data: T;
	success: boolean;
	code: HttpStatusCode;
	message: string;
}
