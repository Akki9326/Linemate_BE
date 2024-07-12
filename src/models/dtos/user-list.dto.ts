import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, ValidateNested } from 'class-validator';
import { ListRequestDto } from './list-request.dto';

class JoiningDateFilter {
	@IsDateString()
	startDate: string;

	@IsDateString()
	endDate: string;
}

export class UserFilterDto {
	@IsBoolean()
	isActive: boolean;

	@ValidateNested()
	@Type(() => JoiningDateFilter)
	joiningDate: JoiningDateFilter;
}
export class UserListDto extends ListRequestDto<UserFilterDto> {}
