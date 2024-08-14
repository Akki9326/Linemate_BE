import { Type } from 'class-transformer';
import { IsDateString, ValidateNested } from 'class-validator';
import { ListRequestDto } from './list-request.dto';

class DateFilter {
	@IsDateString()
	startDate: string;

	@IsDateString()
	endDate: string;
}

export class CohortFilterDto {
	@ValidateNested()
	@Type(() => DateFilter)
	createdBetween: DateFilter;
}
export class CohortListDto extends ListRequestDto<CohortFilterDto> {}
