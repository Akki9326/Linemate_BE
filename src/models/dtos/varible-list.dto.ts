import { IsNumber } from 'class-validator';

import { ListRequestDto } from './list-request.dto';


export class VariableListFilterDto {

    @IsNumber()
    tenantId: number
}
export class variableListDto extends ListRequestDto<VariableListFilterDto> {


}

