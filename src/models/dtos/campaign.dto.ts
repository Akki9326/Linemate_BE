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
	public whatsappTemplateId: number;

	@IsNumber()
	public smsTemplateId: number;

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

	@IsNumber()
	public tenantId: number;

	@IsString()
	public reoccurenceType: string;

	@IsObject()
	public reoccurenceDetails: object;
}
