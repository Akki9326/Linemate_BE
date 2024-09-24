import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ListRequestDto } from './list-request.dto';
import { CampaignStatusType } from '../enums/campaign.enums';

export class CampaignFilterDto {
	
	@IsString()
	@IsIn(['whatsapp', 'viber', 'sms'], { each: true })
	public channel: string;

	@IsString()
	status: CampaignStatusType;

	@IsArray()
	tags: string;

	@IsBoolean()
	isArchived: boolean;
}
export class CampaignListDto extends ListRequestDto<CampaignFilterDto> {}
