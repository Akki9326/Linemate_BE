export interface ContentSection {
	type?: string;
	text?: string;
	handler?: string;
	file?: string;
	sample?: string;
	url?: string;
}

export interface ButtonPayload {
	type: string;
	title: string;
	is_dynamic?: string;
	track_url?: boolean;
	domain?: string;
	flow_action?: string;
	flow_id?: string;
	navigate_screen?: string;
	sample?: string;
}

export interface LanguageContent {
	language: string;
	content: {
		header?: ContentSection | string;
		body?:
			| {
					text?: string;
					sample?: string[];
			  }
			| string;
		footer?:
			| {
					text: string;
			  }
			| string;
		buttons?: ButtonPayload[] | string;
	};
	send_for_approval: boolean;
	template_id: string;
}

export interface ExternalTemplatePayload {
	integration_id: string;
	provider_id: string;
	name: string;
	category: string;
	languages: LanguageContent[];
}
export interface FynoContentPayload {
	content:
		| {
				type: string;
				content: FynoContent;
		  }
		| FynoContent;
}
export interface FynoContent {
	captions?: string;
	type?: string;
	text?: string;
	preview_url?: boolean;
	latitude?: string;
	longitude?: string;
	name?: string;
	url?: string;
}
export interface FynoTemplatePayload {
	name: string;
	event: object;
	template: {
		template_id: string;
		channels: {
			whatsapp?: FynoContentPayload;
			viber?: FynoContentPayload;
		};
		placeholders: object;
	};
}

export interface CardPayload {
	header: {
		type: string;
		handler: string;
		file: string;
		sample: string;
		url: string;
	};
	body: {
		text: string;
	};
	buttons?: ButtonPayload[];
}
