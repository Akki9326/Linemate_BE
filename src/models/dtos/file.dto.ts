import { IsBase64, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { FileType } from '../enums/file-type.enums';
import { UploadFileMediaType } from '../enums/template.enum';

export class FileDto {
	@IsString()
	@IsNotEmpty()
	public name: string;

	@IsBase64()
	public data: Buffer;

	@IsNumber()
	@IsOptional()
	public size: number;

	@IsString()
	public mimetype: string;
}

export class FileTypeDto {
	@IsString()
	public type: FileType;

	@IsOptional()
	@IsString()
	public elementId: number;
}

export class FileMediaType {
	@IsEnum(UploadFileMediaType)
	@IsNotEmpty()
	public mediaType: UploadFileMediaType;

	@IsOptional()
	@IsString()
	public tenantId: number;
}
