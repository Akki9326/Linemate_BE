import { ContentListDto } from '@/models/dtos/content-list.dto';
import { ContentDto } from '@/models/dtos/content.dto';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { ContentService } from '@/services/content.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Request, Response } from 'express-serve-static-core';

class ContentController {
	public contentService = new ContentService();

	public add = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const contentDetails = req.body as ContentDto;
			const userId = req.user.id as number;
			const contentResponse = await this.contentService.add(contentDetails, userId);
			AppResponseHelper.sendSuccess(res, 'Success', contentResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const contentData = req.body as ContentDto;
			const contentId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const contentResponse = await this.contentService.update(contentData, contentId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', contentResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const contentId = parseInt(req.params.id);
			const contentResponse = await this.contentService.one(contentId);
			AppResponseHelper.sendSuccess(res, 'Success', contentResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const pageModel = req.body as ContentListDto; // Provide the missing type argument
			const tenantId = req.tenantId as number;
			const contentResponse = await this.contentService.all(pageModel, tenantId);
			AppResponseHelper.sendSuccess(res, 'Success', contentResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public delete = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const contentId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const contentResponse = await this.contentService.remove(contentId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', contentResponse);
		} catch (ex) {
			next(ex);
		}
	};
}

export default ContentController;
