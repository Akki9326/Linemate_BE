import { AssignCampaign, CampaignMasterDto } from '@/models/dtos/campaign.dto';
import validationMiddleware from '@/middlewares/validation.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import CampaignController from '@/controllers/campaign.controller';
import { Routes } from '@/models/interfaces/routes.interface';
import { Router } from 'express';
import headerMiddleware from '@/middlewares/header.middleWare';

class CampaignRoute implements Routes {
	public path = '/campaign';
	public router = Router();
	public campaignController = new CampaignController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(
			`${this.path}/v1/assign-campaign`,
			validationMiddleware(AssignCampaign, 'body'),
			authMiddleware,
			this.campaignController.assignMultiCampaign,
		);
		this.router.post(`${this.path}/v1/add`, validationMiddleware(CampaignMasterDto, 'body'), authMiddleware, this.campaignController.add);
		this.router.post(`${this.path}/v1/list`, authMiddleware, headerMiddleware, this.campaignController.list);
		this.router.post(`${this.path}/v1/:campaignId`, authMiddleware, this.campaignController.getCampaignDetails);
		this.router.get(`${this.path}/v1/:id`, authMiddleware, this.campaignController.getById);
		this.router.delete(`${this.path}/v1/:id`, authMiddleware, this.campaignController.delete);
		this.router.put(`${this.path}/v1/:id`, validationMiddleware(CampaignMasterDto, 'body'), authMiddleware, this.campaignController.update);
		this.router.post(`${this.path}/v1/:id/clone`, authMiddleware, this.campaignController.cloneCampaign);
		this.router.post(`${this.path}/v1/fire-campaign/:id`, authMiddleware, this.campaignController.fireCampaign);
	}
}

export default CampaignRoute;
