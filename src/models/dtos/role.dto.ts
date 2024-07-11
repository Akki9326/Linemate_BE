import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ListRequestDto } from './list-request.dto';
import { RoleType } from '../enums/role.enum';

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
  public permissionIds:number[]

  @IsArray()
  public userIds:number[]
  
  @IsNumber()
  @IsOptional()
  public tenantId:number
}

export class RoleListRequestDto extends ListRequestDto<{}> {


}
