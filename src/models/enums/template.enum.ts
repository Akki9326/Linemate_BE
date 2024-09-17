export enum TemplateType {
	ExternalTemplate = 'template',
	Simple = 'simple',
	Interactive = 'Interactive',
}

export enum TemplateStatus {
	Draft = 'draft',
	Pending = 'pending',
	Approved = 'approved',
}

export enum Channel {
	Whatsapp = 'whatsapp',
	SMS = 'SMS',
	Viber = 'viber',
}
export enum HeaderType {
	Text = 'text',
	Media = 'media',
}
export enum MessageType {
	Image = 'image',
	Video = 'video',
	Audio = 'audio',
	File = 'file',
	Location = 'location',
	Sticker = 'sticker',
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
	request = 'request_location',
	address = 'address_message',
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
