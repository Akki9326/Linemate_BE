import { IsString } from 'class-validator';
import { ListRequestDto } from './list-request.dto';
export class AssessmentListFilterDto {
	@IsString()
	contentId: string;
}
export class AssessmentListRequestDto extends ListRequestDto<AssessmentListFilterDto> {}
