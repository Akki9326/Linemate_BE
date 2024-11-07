import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { ListRequestDto } from './list-request.dto';
import { FilterResponse } from '../interfaces/filter.interface';

export class CohortFilterDto {
	@IsBoolean()
	isActive: boolean;

	@IsArray()
	dynamicFilter: FilterResponse[];

	@IsBoolean()
	@IsOptional()
	excludeRuleCohorts: boolean;
}
export class CohortListDto extends ListRequestDto<CohortFilterDto> { }
