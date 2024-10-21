import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsDate, IsArray, IsBoolean } from 'class-validator';
import { SortOrder } from '../enums/sort-order.enum';
import { ContentStatus, ConteTypes } from '../enums/contentType.enum';
import { FilterResponse } from '../interfaces/filter.interface';

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

export class ContentListFilterDto {
	@IsEnum(ContentStatus)
	public status: ContentStatus;

	@IsDate()
	public startDate: Date;

	@IsDate()
	public endDate: Date;

	@IsOptional()
	@IsBoolean()
	public archive: boolean;

	@IsEnum(ConteTypes)
	public mediaType: ConteTypes;

	@IsArray()
	dynamicFilter: FilterResponse[];

	@IsBoolean()
	isArchive: boolean;
}

export class ContentListRequestDto extends ListRequestDto<ContentListFilterDto> {}
