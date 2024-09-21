import { CampaignMasterDto } from '@/models/dtos/campaign.dto';
import { CampaignService } from '@/services/campaign.service';
import { NextFunction, Response, Request } from 'express-serve-static-core';
import { AppResponseHelper } from '@/utils/helpers/app-response.helper';

 class CampaignController {
	public campaignService = new CampaignService();
	public add = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const campaignDetails = req.body as CampaignMasterDto;
            const userId = req.user.id as number
			const campaignResponse = await this.campaignService.add(campaignDetails,userId);
			AppResponseHelper.sendSuccess(res, 'Success', campaignResponse);
		} catch (ex) {
			next(ex);
		}
	};
}
export default CampaignController   