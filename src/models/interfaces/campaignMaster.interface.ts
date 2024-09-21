import { ChannelType, CampaignStatusType } from '../enums/campaign.enums';
export interface CampaignMaster {
	id: number;
	name: string;
	description: string;
	channel: ChannelType;
	whatsappTemplateId: number;
	smsTemplateId: number;
	viberTemplateId: number;
	rules: object[];
	tags?: string[];
	status: CampaignStatusType;
	isArchived?: boolean;
}
