import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { ChannelType, CampaignStatusType } from '../enums/campaign.enums';

export class CampaignMasterDto {
	@IsString()
	@IsNotEmpty()
	public name: string;

	@IsString()
	public description: string;

	@IsEnum(ChannelType)
	public channel: ChannelType;

	@IsNumber()
	public whatsappTemplateId: number;

	@IsNumber()
	public smsappTemplateId: number;

	@IsNumber()
	public viberTemplateId: number;

	@IsArray()
	public rules: object[];

	@IsArray()
	@IsOptional()
	public tags: string[];

	@IsEnum(CampaignStatusType)
	public status: CampaignStatusType;

	@IsBoolean()
	@IsOptional()
	public isArchived: boolean;
}
