import { IsArray, IsDate, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { CampaignStatusType } from '../enums/campaign.enums';
import { Channel } from '@/models/enums/template.enum';
import { FilterResponse } from '../interfaces/filter.interface';
import { SortOrder } from '../enums/sort-order.enum';

export class ListRequestDto<T> {
	@IsOptional()
	public page: number;

	@IsOptional()
	public limit: number;

	@IsOptional()
	@IsString()
	public search: string;

	@IsOptional()
	@IsObject()
	public filter: T;

	@IsOptional()
	public sortField: string;

	@IsEnum(SortOrder)
	public sortOrder: SortOrder;
}

export class CampaignListFilterDto {
	@IsEnum(Channel)
	public channel: Channel;

	@IsDate()
	public lastTrigger: Date;

	@IsDate()
	public nextTrigger: Date;

	@IsEnum(CampaignStatusType)
	public status: CampaignStatusType;

	@IsArray()
	dynamicFilter: FilterResponse[];
}

export class CampaignListRequestDto extends ListRequestDto<CampaignListFilterDto> {}
