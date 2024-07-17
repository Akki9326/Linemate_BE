import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RoleType } from '../enums/role.enum';
import { ListRequestDto } from './list-request.dto';

export class RoleDto {
	@IsString()
	@IsNotEmpty()
	public name: string;

	@IsEnum(RoleType)
	@IsNotEmpty()
	public type: RoleType;

	@IsString()
	@IsNotEmpty()
	public description: string;

	@IsArray()
	public permissionIds: number[];

	@IsArray()
	public userIds: number[];

	@IsNumber()
	public tenantId: number;
}
export class RoleListFilterDto {}
export class RoleListRequestDto extends ListRequestDto<RoleListFilterDto> {}
