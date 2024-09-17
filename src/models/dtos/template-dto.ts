import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsLatitude,
	IsLongitude,
	IsLowercase,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
	ValidateNested,
} from 'class-validator';
import {
	ActionType,
	ButtonType,
	Channel,
	ContentSubType,
	ContentType,
	FlowType,
	HeaderType,
	MediaType,
	MessageType,
	TemplateType,
} from '../enums/template.enum';
import { Type } from 'class-transformer';

export class TemplateDto {
	@IsString()
	@IsNotEmpty()
	@IsLowercase()
	@Matches(/^[a-z0-9 ]+$/, { message: 'Name can only contain lowercase letters, numbers, and spaces' })
	public name: string;

	@IsString()
	description: string;

	@IsString()
	public clientTemplateId: string;

	@IsString()
	public HSMUserId: string;

	@IsString()
	public HSMPassword: string;

	@IsString()
	public ISDCode: string;

	@IsString()
	public businessNumber: string;

	@IsEnum(Channel)
	public channel: Channel;

	@IsNumber()
	@IsNotEmpty()
	public tenantId: number;

	@IsEnum(TemplateType)
	@IsNotEmpty()
	public templateType: TemplateType;

	@IsEnum(ContentType)
	@IsOptional()
	public contentType: ContentType;

	@IsEnum(HeaderType)
	@IsOptional()
	public headerType: HeaderType;

	@IsEnum(MediaType)
	@IsOptional()
	public headerMediaType: MediaType;

	@IsString()
	@IsOptional()
	public headerContent: string;

	@IsString()
	@IsNotEmpty()
	public language: string;

	@IsArray()
	@IsOptional()
	public headerPlaceHolder: number[];

	@IsString()
	@IsNotEmpty()
	public body: string;

	@IsArray()
	@IsOptional()
	public bodyPlaceHolder: number[];

	@IsString()
	@IsOptional()
	public footer: string;

	@IsEnum(ButtonType)
	@IsOptional()
	public buttonType: ButtonType;

	@IsString()
	@IsOptional()
	public buttonContent: string;

	@IsString()
	@IsOptional()
	public buttonWebContent: string;

	@IsBoolean()
	@IsOptional()
	public isTrackURL: boolean;

	@IsBoolean()
	@IsOptional()
	public isPreviewUrl: boolean;

	@IsEnum(MessageType)
	@IsOptional()
	public messageType: MessageType;

	@IsString()
	@IsOptional()
	public contentUrl: string;

	@IsString()
	@IsOptional()
	public caption: string;

	@IsOptional()
	@IsLatitude()
	public latitude: number;

	@IsOptional()
	@IsLongitude()
	public longitude: number;

	@IsString()
	@IsOptional()
	public address: string;

	@IsEnum(ContentSubType)
	@IsOptional()
	public contentSubType: ContentSubType;

	@IsString()
	@IsOptional()
	public additionalData: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TemplateButtonDto)
	public buttons: TemplateButtonDto[];
}

export class TemplateButtonDto {
	@IsEnum(ButtonType)
	@IsOptional()
	public buttonType: ButtonType;

	@IsEnum(ActionType)
	@IsOptional()
	public actionType: ActionType;

	@IsString()
	@IsOptional()
	public title: string;

	@IsString()
	@IsOptional()
	public websiteUrl: string;

	@IsBoolean()
	@IsOptional()
	public isDynamicUrl: boolean;

	@IsString()
	@IsOptional()
	public navigateScreen: string;

	@IsString()
	@IsOptional()
	public initialScreen: string;

	@IsString()
	@IsOptional()
	public flowId: string;

	@IsEnum(FlowType)
	@IsOptional()
	public flowAction: FlowType;

	@IsString()
	@IsOptional()
	public flowToken: string;
}
