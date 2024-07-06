import { IsString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { PermissionType } from '../enums/permissions.enum';

export class PermissionDto {

  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsEnum(PermissionType)
  @IsNotEmpty()
  public type: PermissionType;

  @IsOptional()
  @IsNumber()
  public parentId?: number;

  @IsString()
  @IsNotEmpty()
  public description: string;
}
