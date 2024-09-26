import { IsBoolean, IsDate, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Channel } from 'diagnostics_channel';
import { SortOrder } from '../enums/sort-order.enum';
import { TemplateStatus } from '../enums/template.enum';

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
export class TemplateListFilterDto {
	@IsBoolean()
	public isDeleted: boolean;

	@IsEnum(Channel)
	public channel: Channel;

	@IsEnum(TemplateStatus)
	public status: TemplateStatus;

	@IsDate()
	public startDate: Date;

	@IsDate()
	public endDate: Date;

	@IsNumber()
	public createdBy: number;

	@IsString()
	public language: string;
}
export class TemplateListRequestDto extends ListRequestDto<TemplateListFilterDto> {}
