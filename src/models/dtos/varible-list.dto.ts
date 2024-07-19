import { IsString } from 'class-validator';
import { ListRequestDto } from './list-request.dto';

export class VariableListFilterDto {
	@IsString()
	category: string;
}
export class variableListDto extends ListRequestDto<VariableListFilterDto> {}
