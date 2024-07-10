import { IsNumber } from 'class-validator';
import { ListRequestDto } from './list-request.dto';


export class UserFilterDto {

    @IsNumber()
    tenantId: number
}
export class userListDto extends ListRequestDto<UserFilterDto> {


}

