import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
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
export class TenantListFilterDto {}
export class TenantListRequestDto extends ListRequestDto<TenantListFilterDto> {}
