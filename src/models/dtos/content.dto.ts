import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ConteTypes } from '../enums/contentType.enum';

export class ContentDto {
	@IsString()
	@IsNotEmpty()
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
}
