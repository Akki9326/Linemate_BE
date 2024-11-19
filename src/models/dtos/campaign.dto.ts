import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { CampaignStatusType, Channel } from '../enums/campaign.enums';

export class CampaignMasterDto {
	@IsString()
	@IsNotEmpty()
	public name: string;

	@IsString()
	@IsOptional()
	public description: string;

	@IsArray()
	@IsEnum(Channel, { each: true })
	public channel: Channel[];

	@IsNumber()
	@IsOptional()
	public whatsappTemplateId: number;

	@IsNumber()
	@IsOptional()
	public smsTemplateId: number;

	@IsNumber()
	@IsOptional()
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

	@IsNumber()
	public tenantId: number;

	@IsNumber()
	@IsOptional()
	public deliveryStatus: number;

	@IsString()
	public reoccurenceType: string;

	@IsObject()
	public reoccurenceDetails: object;

	@IsArray()
	@IsOptional()
	public userIds: number[];

	@IsString()
	@IsOptional()
	fynoCampaignId: string;
}

export class AssignCampaign {
	@IsArray()
	@IsOptional()
	public userIds: number[];

	@IsArray()
	@IsNotEmpty()
	public campaignId: number[];
}


export class CampaignActionDto {
	@IsArray()
	public campaignIds: number[];
}