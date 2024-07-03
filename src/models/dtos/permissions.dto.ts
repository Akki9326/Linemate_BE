import { IsString, IsEmail, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class PermissionDto {

  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public type: string;

  @IsOptional()
  @IsNumber()
  public parentId?: number;

  @IsString()
  @IsNotEmpty()
  public description: string;
}
