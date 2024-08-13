import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { SortOrder } from '../enums/sort-order.enum';

export class ListRequestDto<T> {
	@IsNotEmpty()
	public page: number;

	@IsNotEmpty()
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
