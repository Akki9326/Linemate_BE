import { CampaignMasterDto } from '@/models/dtos/campaign.dto';
import validationMiddleware from '@/middlewares/validation.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import CampaignController from '@/controllers/campaign.controller';
import { Routes } from '@/models/interfaces/routes.interface';
import { Router } from 'express';

class CampaignRoute implements Routes {
	public path = '/campaign';
	public router = Router();
	public campaignController = new CampaignController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(`${this.path}/v1/add`, validationMiddleware(CampaignMasterDto, 'body'), authMiddleware, this.campaignController.add);
	}
}

export default CampaignRoute;
