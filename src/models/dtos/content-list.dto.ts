import { IsArray } from 'class-validator';
import { ListRequestDto } from './list-request.dto';
import { FilterResponse } from '../interfaces/filter.interface';

export class ContentFilterDto {
	@IsArray()
	dynamicFilter: FilterResponse[];
}
export class ContentListDto extends ListRequestDto<ContentFilterDto> {}
