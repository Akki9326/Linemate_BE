import { HttpStatusCode } from '@/models/enums/http-status-code.enum';
import { AppResponse } from '@/models/interfaces/response.interface';
import { Response } from 'express';

export class AppResponseHelper {
	static send<T>(res: Response, responseData: AppResponse<T>) {
		return res.status(responseData.code).json(responseData);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static sendSuccess(res: Response, message: string, data: any) {
		const resp = {
			data: data,
			success: true,
			code: HttpStatusCode.SUCCESS,
			message: message,
		};

		this.send(res, resp);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
