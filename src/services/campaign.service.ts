import DB from '@/databases';
import { BelongsTo, Op, Sequelize, WhereOptions } from 'sequelize';
import { CampaignMasterDto } from '@/models/dtos/campaign.dto';

export class CampaignService {
	private campaignMaster = DB.CampaignMaster;

	constuructor() {}

	public async add(campaignDetails: CampaignMasterDto, userId: number) {
        
    }
}
