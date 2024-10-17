import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { SortOrder } from '../enums/sort-order.enum';
import { FilterResponse } from '../interfaces/filter.interface';

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
	public isArchive: boolean;

	@IsArray()
	dynamicFilter: FilterResponse[];
}
export class TemplateListRequestDto extends ListRequestDto<TemplateListFilterDto> {}
