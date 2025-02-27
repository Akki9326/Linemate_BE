import { FileDto, FileMediaType } from '@/models/dtos/file.dto';
import { TemplateActionDto, TemplateDto } from '@/models/dtos/template-dto';
import { TemplateListRequestDto } from '@/models/dtos/template-list.dto';
import { RequestWitFile, RequestWithUser } from '@/models/interfaces/auth.interface';
import { TemplateService } from '@/services/template.service';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { NextFunction, Response } from 'express-serve-static-core';

class TemplateController {
	public templateService = new TemplateService();

	public create = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const templateDetails: TemplateDto = req.body;
			const userId = req.user.id as number;
			const template = await this.templateService.add(templateDetails, userId);
			AppResponseHelper.sendSuccess(res, 'Success', template);
		} catch (ex) {
			next(ex);
		}
	};
	public one = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const templateId = parseInt(req.params.id);
			const template = await this.templateService.one(templateId);
			AppResponseHelper.sendSuccess(res, 'Success', template);
		} catch (ex) {
			next(ex);
		}
	};
	public delete = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const templateId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const template = await this.templateService.delete(templateId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', template);
		} catch (ex) {
			next(ex);
		}
	};
	public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const pageModel = req.body as TemplateListRequestDto; // Provide the missing type argument
			const tenantId = req.tenantId as number;
			const template = await this.templateService.all(pageModel, tenantId);
			AppResponseHelper.sendSuccess(res, 'Success', template);
		} catch (ex) {
			next(ex);
		}
	};
	public uploadTemplateFile = async (req: RequestWitFile, res: Response, next: NextFunction) => {
		try {
			const files: FileDto = req.files.file;
			const requestBody = req.body as FileMediaType;
			const template = await this.templateService.uploadTemplateFile(files, requestBody);
			AppResponseHelper.sendSuccess(res, 'Success', template);
		} catch (ex) {
			next(ex);
		}
	};
	public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const templateDetails: TemplateDto = req.body;
			const userId = req.user.id as number;
			const templateId = parseInt(req.params.id);
			const template = await this.templateService.update(templateDetails, templateId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', template);
		} catch (ex) {
			next(ex);
		}
	};
	public archiveTemplate = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const templateIds = req.body.templateIds as TemplateActionDto;
			const userId: number = req.user.id;
			const userResponse = await this.templateService.archive(templateIds, userId);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};

	public bulkDeleteTemplate = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const templateIds = req.body.templateIds as TemplateActionDto;
			const userId: number = req.user.id;
			const userResponse = await this.templateService.bulkDelete(templateIds, userId);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public unArchiveTemplate = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const userIds = req.body.templateIds as TemplateActionDto;
			const userId: number = req.user.id;
			const userResponse = await this.templateService.unArchive(userIds, userId);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};
}

export default TemplateController;
