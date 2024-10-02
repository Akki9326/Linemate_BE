import { IsArray, IsBoolean } from 'class-validator';
import { ListRequestDto } from './list-request.dto';
import { FilterResponse } from '../interfaces/filter.interface';

export class CohortFilterDto {
	@IsBoolean()
	isActive: boolean;

	@IsArray()
	dynamicFilter: FilterResponse[];
}
export class CohortListDto extends ListRequestDto<CohortFilterDto> {}
