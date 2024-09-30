import { CampaignMasterDto } from '@/models/dtos/campaign.dto';
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
		this.router.post(`${this.path}/v1/add`, validationMiddleware(CampaignMasterDto, 'body'), authMiddleware, this.campaignController.add);
		this.router.get(`${this.path}/v1/:id`, authMiddleware, this.campaignController.getById);
		this.router.delete(`${this.path}/v1/:id`, authMiddleware, this.campaignController.delete);
		this.router.post(`${this.path}/v1/list`, authMiddleware, headerMiddleware, this.campaignController.list);
		this.router.put(`${this.path}/v1/:id`, validationMiddleware(CampaignMasterDto, 'body'), authMiddleware, this.campaignController.update);
	}
}

export default CampaignRoute;
