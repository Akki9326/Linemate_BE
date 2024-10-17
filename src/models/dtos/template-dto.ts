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
	CardMediaType,
	Channel,
	ContentSubType,
	ContentType,
	FlowType,
	HeaderType,
	MediaType,
	MessageType,
	TemplateStatus,
	TemplateType,
} from '../enums/template.enum';
import { Type } from 'class-transformer';

export class TemplateButtonDto {
	@IsNumber()
	@IsOptional()
	public id: number;

	@IsEnum(ButtonType)
	@IsOptional()
	public buttonType: ButtonType;

	@IsString()
	@IsOptional()
	public title: string;

	@IsString()
	@IsOptional()
	public buttonId: string;

	@IsString()
	@IsOptional()
	public buttonDescription: string;

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
	public sample: string;

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

	@IsBoolean()
	@IsOptional()
	public isTrackUrl: boolean;

	@IsOptional()
	public additionalData: object;

	@IsString()
	@IsOptional()
	public sectionName: string;

	@IsNumber()
	@IsOptional()
	public sectionId: number;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TemplateButtonDto)
	@IsOptional()
	public buttons: TemplateButtonDto[];
}

export class TemplateContentCardDto {
	@IsNumber()
	@IsOptional()
	public id: number;

	@IsEnum(CardMediaType)
	@IsOptional()
	public mediaType: CardMediaType;

	@IsString()
	@IsOptional()
	public contentUrl: string;

	@IsString()
	@IsOptional()
	public mediaHandle: string;

	@IsString()
	@IsOptional()
	public mediaSample: string;

	@IsBoolean()
	@IsOptional()
	public isDynamicUrl: boolean;

	@IsString()
	@IsOptional()
	public body: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TemplateButtonDto)
	@IsOptional()
	public buttons: TemplateButtonDto[];

	@IsArray()
	@IsOptional()
	public bodyPlaceHolder: number[];

	@IsArray()
	@IsOptional()
	public buttonIds: number[];
}
export class TemplateActionDto {
	@IsArray()
	public templateIds: number[];
}
export class TemplateDto {
	@IsNumber()
	@IsOptional()
	public id: number;

	@IsString()
	@IsNotEmpty()
	@IsLowercase()
	@Matches(/^[a-z0-9]+[a-z0-9._-]*[a-z0-9]+$/, {
		message: 'Name can only contain lowercase letters, numbers, hyphens, underscores, dots, and should not start or end with special characters.',
	})
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
	public businessContactNumber: string;

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
	@IsOptional()
	public headerMediaUrl: string;

	@IsString()
	@IsOptional()
	public status: TemplateStatus;

	@IsString()
	@IsOptional()
	public headerMediaHandle: string;

	@IsString()
	@IsOptional()
	public headerMediaSample: string;

	@IsString()
	@IsNotEmpty()
	public language: string;

	@IsArray()
	@IsOptional()
	public headerPlaceHolder: number[];

	@IsString()
	@IsOptional()
	public body: string;

	@IsArray()
	@IsOptional()
	public bodyPlaceHolder: number[];

	@IsString()
	@IsOptional()
	public footer: string;

	@IsBoolean()
	@IsOptional()
	public isPreviewUrl: boolean;

	@IsEnum(MessageType)
	@IsOptional()
	public messageType: MessageType;

	@IsString()
	@IsOptional()
	public messageText: string;

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

	@IsOptional()
	@IsString()
	public locationName: string;

	@IsOptional()
	@IsString()
	public templateId: string;

	@IsString()
	@IsOptional()
	public address: string;

	@IsEnum(ContentSubType)
	@IsOptional()
	public contentSubType: ContentSubType;

	@IsEnum(ActionType)
	@IsOptional()
	public actionType: ActionType;

	@IsString()
	@IsOptional()
	public menuButtonName: string;

	@IsArray()
	@IsOptional()
	public buttonIds: number[];

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TemplateButtonDto)
	@IsOptional()
	public buttons: TemplateButtonDto[];

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TemplateContentCardDto)
	@IsOptional()
	public templateContentCards: TemplateContentCardDto[];
}
