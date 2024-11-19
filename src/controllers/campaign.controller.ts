import { AssignCampaign, CampaignActionDto, CampaignMasterDto } from '@/models/dtos/campaign.dto';
import { CampaignListRequestDto } from '@/models/dtos/campaign-list.dto';
import { CampaignService } from '@/services/campaign.service';
import { NextFunction, Response, Request } from 'express-serve-static-core';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { CampaignMatrixDto } from '@/models/dtos/campaignMatrix.dto';

class CampaignController {
	public campaignService = new CampaignService();
	public add = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const campaignDetails = req.body as CampaignMasterDto;
			const userId = req.user.id as number;
			const campaignResponse = await this.campaignService.add(campaignDetails, userId);
			AppResponseHelper.sendSuccess(res, 'Success', campaignResponse);
		} catch (ex) {
			next(ex);
		}
	};

	public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const campaignDetails = req.body as CampaignMasterDto;
			const campaignId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const campaignResponse = await this.campaignService.update(campaignDetails, campaignId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', campaignResponse);
		} catch (ex) {
			next(ex);
		}
	};

	public getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const campaignId = parseInt(req.params.id);
			const campaignResponse = await this.campaignService.one(campaignId);
			AppResponseHelper.sendSuccess(res, 'Success', campaignResponse);
		} catch (ex) {
			next(ex);
		}
	};

	public delete = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const campaignId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const campaignResponce = await this.campaignService.remove(campaignId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', campaignResponce);
		} catch (ex) {
			next(ex);
		}
	};

	public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const pageModel = req.body as CampaignListRequestDto;
			const tenantId = req.tenantId as number;
			const campaigntResponse = await this.campaignService.all(pageModel, tenantId);
			AppResponseHelper.sendSuccess(res, 'Success', campaigntResponse);
		} catch (ex) {
			next(ex);
		}
	};

	public addTrigger = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const triggerDetails = req.body as CampaignMatrixDto;
			const userId = req.user.id as number;
			const campaignResponce = await this.campaignService.addTrigger(triggerDetails, userId);
			AppResponseHelper.sendSuccess(res, 'Success', campaignResponce);
		} catch (ex) {
			next(ex);
		}
	};

	public cloneCampaign = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const campaignId = parseInt(req.params.id);
			const userId = req.user.id as number;
			const campaignResponce = await this.campaignService.cloneCampaign(campaignId, userId);
			AppResponseHelper.sendSuccess(res, 'Success', campaignResponce);
		} catch (ex) {
			next(ex);
		}
	};
	public assignMultiCampaign = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const assignCampaignBody = req.body as AssignCampaign;
			const userId = req.user.id as number;
			const campaignResponse = await this.campaignService.assignMultiCampaign(assignCampaignBody, userId);
			AppResponseHelper.sendSuccess(res, 'Success', campaignResponse);
		} catch (ex) {
			next(ex);
		}
	};

	public getCampaignDetails = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const campaignId = parseInt(req.params.id);
			//const userId = req.user.id as number;
			const campaignResponse = await this.campaignService.getCamapignAnalytics(campaignId);
			AppResponseHelper.sendSuccess(res, 'Success', campaignResponse);
		} catch (ex) {
			next(ex);
		}
	};

	public fireCampaign = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const campaignId = parseInt(req.params.id);
			const campaignResponse = await this.campaignService.fireCampaign(campaignId);
			AppResponseHelper.sendSuccess(res, 'Success', campaignResponse);
		} catch (ex) {
			next(ex);
		}
	};


	public archiveCampaign = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const campaignIds = req.body.campaignIds as CampaignActionDto;
			const userId: number = req.user.id;
			const userResponse = await this.campaignService.archive(campaignIds, userId);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};

	public bulkDeleteCampaign = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const campaignIds = req.body.campaignIds as CampaignActionDto;
			const userId: number = req.user.id;
			const userResponse = await this.campaignService.bulkDelete(campaignIds, userId);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};
	public unArchiveCampaign = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		try {
			const userIds = req.body.campaignIds as CampaignActionDto;
			const userId: number = req.user.id;
			const userResponse = await this.campaignService.unArchive(userIds, userId);
			AppResponseHelper.sendSuccess(res, 'Success', userResponse);
		} catch (ex) {
			next(ex);
		}
	};
}
export default CampaignController;
