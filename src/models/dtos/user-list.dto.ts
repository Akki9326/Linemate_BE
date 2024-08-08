import { IsArray, IsBoolean } from 'class-validator';
import { ListRequestDto } from './list-request.dto';
import { FilterResponse } from '../interfaces/filter.interface';

// class JoiningDateFilter {
// 	@IsDateString()
// 	startDate: string;

// 	@IsDateString()
// 	endDate: string;
// }

export class UserFilterDto {
	@IsBoolean()
	isActive: boolean;

	@IsArray()
	dynamicFilter: FilterResponse[];
}
export class UserListDto extends ListRequestDto<UserFilterDto> {}
