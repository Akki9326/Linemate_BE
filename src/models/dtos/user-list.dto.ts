import { IsBoolean, IsNumber } from 'class-validator';
import { ListRequestDto } from './list-request.dto';


export class UserFilterDto {
    @IsBoolean()
    isActive: boolean
}
export class userListDto extends ListRequestDto<UserFilterDto> {


}

