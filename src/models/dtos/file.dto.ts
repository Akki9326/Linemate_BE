import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBase64 } from 'class-validator';

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
