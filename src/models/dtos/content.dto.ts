import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { ConteTypes } from '../enums/contentType.enum';
import { ScoringType, timeType } from '../enums/assessment.enum';

export class ContentDto {
	@IsString()
	@IsNotEmpty()
	@Length(0, 100)
	public name: string;

	@IsEnum(ConteTypes)
	@IsNotEmpty()
	public type: ConteTypes;

	@IsString()
	@IsOptional()
	public description: string;

	@IsNumber()
	@IsNotEmpty()
	public tenantId: number;

	@IsArray()
	@IsOptional()
	public uploadedFileIds: number[];

	@IsBoolean()
	public isPublish: boolean;

	@IsBoolean()
	public isArchive: boolean;

	@IsOptional()
	@IsEnum(ScoringType)
	public scoring: ScoringType;

	@IsOptional()
	@IsNumber()
	public timed: number;

	@IsOptional()
	@IsNumber()
	public pass: number;

	@IsOptional()
	@IsNumber()
	public score: number;

	@IsOptional()
	@IsEnum(timeType)
	public timeType: timeType;
}

export class ContentActionDto {
	@IsArray()
	public contentIds: number[];
}
