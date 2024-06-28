import { IsString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsArray } from 'class-validator';

export class RoleDto {

  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public type: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsArray()
  public permissionId:number

  @IsArray()
  public userId:number
  
  @IsNumber()
  @IsOptional()
  public tenantId:number
}
