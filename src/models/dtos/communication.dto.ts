import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Channel } from './../enums/campaign.enums';

export class CommunicationDto {
	@IsString()
	@IsOptional()
	public fromNumberId: string;

	@IsString()
	@IsOptional()
	public wabaId: string;

	@IsString()
	@IsNotEmpty()
	public accessToken: string;

	@IsString()
	@IsOptional()
	public customName: string;

	@IsEnum(Channel)
	@IsNotEmpty()
	public channel: Channel;

	@IsString()
	@IsOptional()
	public domain: string;

	@IsString()
	@IsOptional()
	public sender: string;

	@IsNumber()
	@IsNotEmpty()
	public tenantId: number;
}

export class ChannelDto {
	@IsEnum(Channel)
	@IsNotEmpty()
	public channel: Channel;
}
