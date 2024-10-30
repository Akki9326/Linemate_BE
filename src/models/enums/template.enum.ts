export enum TemplateType {
	ExternalTemplate = 'external',
	Simple = 'simple',
	Interactive = 'interactive',
}
export enum TemplateCategory {
	Utility = 'Utility',
	Marketing = 'Marketing',
}

export enum TemplateStatus {
	DRAFT = 'draft',
	PENDING = 'pending',
	APPROVED = 'approved',
	ERROR = 'error',
	REJECTED = 'rejected',
}

export enum HeaderType {
	Text = 'text',
	Media = 'media',
}

export enum MessageType {
	Text = 'text',
	Image = 'image',
	Video = 'video',
	Audio = 'audio',
	File = 'file',
	Location = 'location',
	Sticker = 'sticker',
}

export enum UploadFileMediaType {
	Image = 'image',
	Video = 'video',
	Document = 'document',
}

export enum MediaType {
	Image = 'image',
	Video = 'video',
	Document = 'document',
	Location = 'location',
}

export enum ContentType {
	Common = 'common',
	Carousel = 'carousel',
}

export enum ContentSubType {
	Common = 'common',
	Request = 'requestLocation',
	Address = 'address',
	Flow = 'flow',
}

export enum FlowType {
	Navigate = 'navigate',
	DataExchange = 'data_exchange',
}

export enum ActionType {
	QuickReply = 'quickReply',
	Menu = 'menu',
}

export enum ButtonType {
	QuickReply = 'quickReply',
	WebsiteVisit = 'websiteVisit',
	Flow = 'flow',
}

export enum CardMediaType {
	Image = 'image',
	Video = 'video',
}

export enum FynoWords {
	quickReply = 'quick_reply',
	websiteVisit = 'url',
	common = 'button',
	external = 'template',
	request = 'request_location',
	address = 'address_message',
}

export enum ViberContentType {
	Text = 'text',
	Video = 'video',
	File = 'file',
	Image = 'image',
}
export enum DefaultLanguage {
	EN = 'en',
	AR = 'ar',
}