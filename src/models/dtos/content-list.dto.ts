import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, ValidateNested } from 'class-validator';
import { ListRequestDto } from './list-request.dto';

class DateFilter {
	@IsDateString()
	startDate: string;

	@IsDateString()
	endDate: string;
}

export class ContentFilterDto {
	@IsBoolean()
	archive: boolean;

	@IsBoolean()
	isPublish: boolean;

	@ValidateNested()
	@Type(() => DateFilter)
	updatedBetween: DateFilter;

	@ValidateNested()
	@Type(() => DateFilter)
	createdBetween: DateFilter;
}
export class ContentListDto extends ListRequestDto<ContentFilterDto> {}
