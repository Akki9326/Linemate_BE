import { LanguageService } from '@/services/language.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class LanguageController {
	public languageService = new LanguageService();

	public list = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const languageResponse = await this.languageService.list();
			AppResponseHelper.sendSuccess(res, 'Success', languageResponse);
		} catch (ex) {
			next(ex);
		}
	};
}

export default LanguageController;
