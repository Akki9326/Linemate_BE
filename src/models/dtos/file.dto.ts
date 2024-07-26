import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBase64 } from 'class-validator';
import { FileType } from '../enums/file-type.enums';

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
	public contentId: number;
}
