import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { VariableCategories, VariableType } from '../enums/variable.enum';

export class VariableDto {

  @IsString()
  public name: string;

  @IsBoolean()
  public isMandatory: boolean;

  @IsEnum(VariableType)
  public type: VariableType;

  @IsString()
  public description: string;

  @IsEnum(VariableCategories)
  public category: VariableCategories;

  @IsArray()
  @IsOptional()
  public options: string[];

  @IsNumber()
  public tenantId: number;

  @IsString()
  @IsOptional()
  public placeHolder: string;
}

