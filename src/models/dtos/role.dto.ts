import { IsString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ListRequestDto } from './list-request.dto';
import { RoleType } from '../enums/role.enum';

export class RoleDto {

  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
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
