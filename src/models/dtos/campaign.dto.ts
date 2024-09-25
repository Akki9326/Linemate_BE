import { IsArray, IsBoolean, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CampaignStatusType } from '../enums/campaign.enums';

export class CampaignMasterDto {
	@IsString()
	@IsNotEmpty()
	public name: string;

	@IsString()
	@IsOptional()
	public description: string;

	@IsArray()
	@IsNotEmpty()
	@IsIn(['whatsapp', 'viber', 'sms'], { each: true })
	public channel: string[];

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
}
