import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { IntervalUnitType, TriggerType } from '../enums/campaign.enums';

export class CampaignMatrixDto {
	@IsNumber()
	public campaignId: number;

	@IsEnum(TriggerType)
	public triggerType: TriggerType;

	@IsEnum(IntervalUnitType)
	@IsNotEmpty()
	public intervalUnit: IntervalUnitType;

	@IsDate()
	@IsOptional()
	public startDate: Date;

	@IsDate()
	@IsOptional()
	public endDate: Date;

	@IsBoolean()
	@IsOptional()
	public neverEnds: boolean;

	@IsNumber()
	@IsOptional()
	public endsAfterOccurences: number;

	@IsNumber()
	@IsOptional()
	public triggered: number;

	@IsNumber()
	@IsOptional()
	public delivered: number;

	@IsNumber()
	@IsOptional()
	public read: number;

	@IsNumber()
	@IsOptional()
	public clicked: number;

	@IsNumber()
	@IsOptional()
	public failed: number;
}
