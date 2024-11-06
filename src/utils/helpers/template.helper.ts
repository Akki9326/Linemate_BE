import { FYNO_AUTH_TOKEN, FYNO_BASE_URL, FYNO_WHATSAPP_PROVIDER_ID, FYNO_WHATSAPP_PROVIDER_NAME } from '@/config';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { TemplateModel } from '@/models/db/template.model';
import { FileDto } from '@/models/dtos/file.dto';
import { TemplateButtonDto, TemplateContentCardDto, TemplateDto } from '@/models/dtos/template-dto';
import { FileMimeType } from '@/models/enums/file-type.enums';
import {
	ActionType,
	ButtonType,
	ContentSubType,
	ContentType,
	FynoWords,
	HeaderType,
	MediaType,
	MessageType,
	TemplateCategory,
	TemplateType,
	ViberContentType,
} from '@/models/enums/template.enum';
import { CommunicationResponse } from '@/models/interfaces/communication.interface';
import {
	ButtonPayload,
	CardPayload,
	ContentSection,
	ExternalTemplatePayload,
	FynoContentPayload,
	FynoTemplatePayload,
	LanguageContent,
} from '@/models/interfaces/template.interface';
import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { TemplateMessage } from './app-message.helper';

export const TemplateGenerator = {
	isValidUrl: (url: string) => {
		const urlPattern = new RegExp(
			'^(https?:\\/\\/)?' +
				'((([a-zA-Z0-9$-_@.&+!*"(),]|[a-zA-Z0-9-])+\\.)+[a-zA-Z]{2,})' +
				'(\\/[a-zA-Z0-9$-_@.&+!*"(),]|[a-zA-Z0-9-]+)*' +
				'(\\?[a-zA-Z0-9$-_@.&+!*"(),]|[a-zA-Z0-9-]+)*' +
				'(#[a-zA-Z0-9$-_@.&+!*"(),]|[a-zA-Z0-9-]+)*' +
				'\\/$',
			'i',
		);
		return urlPattern.test(url);
	},
	getEnumKeyByValue(enumObject: typeof FileMimeType, value: string) {
		return Object.keys(enumObject).find(key => enumObject[key] === value);
	},
	getAllowedMimeTypes(mediaType: string): FileMimeType[] {
		const allowedMimeTypes: { [key: string]: FileMimeType[] } = {
			image: [FileMimeType.jpg, FileMimeType.png, FileMimeType.jpeg],
			document: [FileMimeType.pdf],
			video: [FileMimeType.mp4, 'video/3gpp' as FileMimeType],
		};

		return allowedMimeTypes[mediaType] || [];
	},
	validateMimeType: (mimetype: string, mediaType: string) => {
		const allowedExtensions = TemplateGenerator.getAllowedMimeTypes(mediaType);
		if (allowedExtensions.includes(mimetype as FileMimeType)) {
			return { isValid: true, allowedMimeTypes: allowedExtensions };
		}
		const mimeTypeParts = mimetype.split('/')[1];
		const subTypeParts = mimeTypeParts.split('.');
		const fileExtension = subTypeParts[subTypeParts.length - 1] || mimeTypeParts;

		const isValid = allowedExtensions.includes(fileExtension as FileMimeType);
		const allowedEnumKeys = allowedExtensions?.map(mimeType => TemplateGenerator.getEnumKeyByValue(FileMimeType, mimeType));
		return { isValid, allowedMimeTypes: allowedEnumKeys };
	},
	processButtons: (buttons: TemplateButtonDto[]): ButtonPayload[] => {
		if (!buttons || buttons.length === 0) {
			return [];
		}

		return buttons.map((button, index) => {
			let mappedButtonType: string;
			if (!button.buttonType) {
				throw new BadRequestException(`buttonType is required for button at index ${index}.`);
			}
			switch (button.buttonType) {
				case ButtonType.QuickReply:
					mappedButtonType = FynoWords.quickReply;
					break;
				case ButtonType.WebsiteVisit:
					mappedButtonType = FynoWords.websiteVisit;
					break;
				case ButtonType.Flow:
					mappedButtonType = ButtonType.Flow;
					break;
				default:
					throw new BadRequestException(`Unsupported button type: ${button.buttonType}`);
			}
			if (
				(mappedButtonType === FynoWords.quickReply || mappedButtonType === FynoWords.websiteVisit || mappedButtonType === ButtonType.Flow) &&
				(!button.title || button.title?.trim() === '')
			) {
				throw new BadRequestException(`title is required for ${button.buttonType} button at index ${index}.`);
			}

			if (mappedButtonType === FynoWords.websiteVisit) {
				if (!button.websiteUrl || button.websiteUrl?.trim() === '') {
					throw new BadRequestException(`websiteUrl is required for WebsiteVisit button at index ${index}.`);
				}
			}

			if (mappedButtonType === ButtonType.Flow) {
				if (!button.flowAction || !button.flowId || !button.navigateScreen) {
					throw new BadRequestException(`flowAction, flowId, and navigateScreen are required for flow button at index ${index}.`);
				}
			}

			const buttonPayload: ButtonPayload = {
				title: button.title!,
				type: mappedButtonType,
			};

			if (mappedButtonType === FynoWords.websiteVisit) {
				if (!TemplateGenerator.isValidUrl(button.websiteUrl)) {
					throw new BadRequestException(`Invalid websiteUrl in button at index ${index}`);
				}
				buttonPayload.is_dynamic = button.isDynamicUrl.toString();
				buttonPayload.track_url = button.isTrackUrl;
				buttonPayload.sample = button.sample;
				if (button.isDynamicUrl) {
					buttonPayload.domain = button.websiteUrl + `{{1}}`;
				} else {
					buttonPayload.domain = button.websiteUrl;
				}
			}

			if (mappedButtonType === ButtonType.Flow) {
				buttonPayload.flow_action = button.flowAction;
				buttonPayload.flow_id = button.flowId;
				buttonPayload.navigate_screen = button.navigateScreen;
			}

			return buttonPayload;
		});
	},
	processContentCards: (contentCards: TemplateContentCardDto[]): CardPayload[] => {
		if (!contentCards || contentCards.length === 0) {
			return [];
		}

		return contentCards.map((card, index) => {
			if (!card.mediaType) {
				throw new BadRequestException(`mediaType is required for contentCard at index ${index}.`);
			}
			if (!card.contentUrl) {
				throw new BadRequestException(`contentUrl is required for contentCard at index ${index}.`);
			}
			if (!card.mediaHandle) {
				throw new BadRequestException(`mediaHandle is required for contentCard at index ${index}.`);
			}
			if (!card.body) {
				throw new BadRequestException(`body is required for contentCard at index ${index}.`);
			}

			const cardPayload: CardPayload = {
				header: {
					type: card.mediaType,
					file: card.contentUrl,
					handler: card.mediaHandle,
					sample: card.mediaSample,
					url: card.contentUrl,
				},
				body: {
					text: card.body,
				},
			};

			// Optionally process buttons within contentCards if present
			if (card.buttons && card.buttons.length > 0) {
				cardPayload.buttons = TemplateGenerator.processButtons(card.buttons);
			}

			return cardPayload;
		});
	},
	externalTemplatePayload: (
		templateDetails: TemplateDto,
		providerTemplateId: string,
		communication: CommunicationResponse,
	): ExternalTemplatePayload => {
		if (!templateDetails) {
			throw new BadRequestException('Template details are required to generate the payload.');
		}
		const {
			name,
			language,
			headerType,
			headerMediaType,
			headerContent,
			headerMediaUrl,
			headerMediaHandle,
			headerMediaSample,
			body,
			footer,
			buttons,
			templateContentCards,
			contentType,
		} = templateDetails;
		const content: {
			header?: ContentSection;
			body?: { text: string; sample: string[] };
			footer?: { text: string };
			buttons?: ButtonPayload[];
			cards: CardPayload[];
		} = { cards: [] };
		if (headerType) {
			if (contentType === ContentType.Common) {
				if (headerType === HeaderType.Text) {
					if (!headerContent) {
						throw new BadRequestException(`headerContent is required when headerType is ${HeaderType.Text}`);
					}
					content.header = {
						type: headerType,
						text: headerContent,
					};
				} else {
					if (headerMediaType === MediaType.Location) {
						content.header = {
							type: headerMediaType,
						};
					} else {
						if (!headerMediaUrl || !headerMediaHandle || !headerMediaSample) {
							throw new BadRequestException('headerMediaUrl, headerMediaHandle, and headerMediaSample are required for media types');
						}
						content.header = {
							type: headerMediaType,
							file: headerMediaUrl,
							handler: headerMediaHandle,
							sample: headerMediaSample,
							url: headerMediaUrl,
						};
					}
				}
			}
		}

		if (body) {
			const replacedWords: string[] = [];
			let placeholderIndex = 1;
			const updatedBody = body.replace(/{{\w+}}/g, match => {
				replacedWords.push(match.replace(/{{|}}/g, ''));
				return `{{${placeholderIndex++}}}`;
			});
			if (replacedWords?.length) {
				replacedWords;
			}
			content.body = { text: updatedBody + '.', sample: replacedWords };
		} else {
			throw new BadRequestException('body is required');
		}
		if (footer) {
			if (contentType === ContentType.Common) {
				content.footer = { text: footer };
			}
		}

		if (buttons && buttons.length > 0) {
			content.buttons = TemplateGenerator.processButtons(buttons);
		}

		if (templateContentCards && templateContentCards.length > 0 && contentType === ContentType.Carousel) {
			content.cards = TemplateGenerator.processContentCards(templateContentCards);
		}

		const payload: ExternalTemplatePayload = {
			integration_id: communication?.integrationId,
			provider_id: FYNO_WHATSAPP_PROVIDER_ID,
			name: name,
			category: TemplateCategory.Marketing,
			languages: [
				{
					language: language,
					content: {
						...content,
					},
					send_for_approval: true,
					template_id: providerTemplateId,
				},
			],
		};

		return payload;
	},
	generateSimpleContent: (templateDetails: TemplateDto) => {
		let content:
			| { type: string; text: string; preview_url: boolean }
			| { type: string; caption: string; url: string }
			| { type: string; caption: string; url: string }
			| { type: string; caption: string; url: string }
			| { type: string; latitude: string; longitude: string; name: string; address: string }
			| { type: string; url: string }
			| undefined;
		const { messageType, messageText, caption, contentUrl, latitude, longitude, locationName, isPreviewUrl, address } = templateDetails;
		switch (messageType) {
			case MessageType.Text:
				content = {
					type: MessageType.Text,
					text: messageText,
					preview_url: isPreviewUrl,
				};
				break;
			case MessageType.Video:
				content = {
					type: MessageType.Video,
					caption: caption,
					url: contentUrl,
				};
				break;
			case MessageType.Image:
				content = {
					type: MessageType.Image,
					caption: caption,
					url: contentUrl,
				};
				break;
			case MessageType.Audio:
				content = {
					type: MessageType.Audio,
					caption: caption,
					url: contentUrl,
				};
				break;
			case MessageType.File:
				content = {
					type: MessageType.File,
					caption: caption,
					url: contentUrl,
				};
				break;
			case MessageType.Location:
				content = {
					type: MessageType.Location,
					latitude: latitude?.toString(),
					longitude: longitude?.toString(),
					name: locationName,
					address: address,
				};
				break;
			case MessageType.Sticker:
				content = {
					type: MessageType.Sticker,
					url: contentUrl,
				};
				break;
			default:
				throw new BadRequestException('Unsupported message type');
		}
		return content;
	},
	quickButtonsMapping: (buttons: TemplateButtonDto[]) => {
		return {
			buttons: buttons.map(button => {
				return {
					id: button.buttonId,
					title: button.title,
				};
			}),
		};
	},
	menuButtonsMapping: (
		buttons: { sectionName: string; buttons: { title: string; buttonDescription: string; buttonId: string }[] }[] | TemplateButtonDto,
		menuButtonName: string,
		contentSubType: ContentSubType,
	) => {
		if (contentSubType === ContentSubType.Flow) {
			return {
				[ContentSubType.Flow]: {
					id: buttons[0].flowId,
					cta: buttons[0].title,
					token: buttons[0].flowToken,
					type: buttons[0].flowAction,
					screen: buttons[0].initialScreen,
					extras: buttons[0].additionalData,
				},
			};
		} else {
			const mappedButton = Array.isArray(buttons)
				? buttons.map(section => {
						return {
							title: section.sectionName,
							rows: section.buttons.map(button => {
								return {
									id: uuidv4(),
									title: button.title,
									description: button.buttonDescription,
									buttonId: button.buttonId,
								};
							}),
						};
				  })
				: [];
			return {
				button: menuButtonName,
				sections: mappedButton,
			};
		}
	},
	generateInteractiveContent: (templateDetails: TemplateDto) => {
		const { contentSubType, body, footer, messageType } = templateDetails;

		if (!contentSubType) {
			throw new BadRequestException('content sub type is not defined');
		}

		if (templateDetails?.buttons?.length > 3) {
			throw new BadRequestException('Only 3 buttons are allowed');
		}
		const content = {
			type: FynoWords[contentSubType] ? (templateDetails?.actionType === ActionType.QuickReply ? FynoWords[contentSubType] : 'list') : contentSubType,
			header: messageType && TemplateGenerator.generateSimpleContent(templateDetails),
			body: {
				text: body,
			},
			action: templateDetails?.buttons?.length
				? templateDetails?.actionType === ActionType.QuickReply
					? TemplateGenerator.quickButtonsMapping(templateDetails.buttons)
					: TemplateGenerator.menuButtonsMapping(templateDetails.buttons, templateDetails.menuButtonName, templateDetails.contentSubType)
				: [],
			footer: {
				text: footer,
			},
		};

		return content;
	},
	fynoTemplatePayload: (templateDetails: TemplateDto, providerTemplateId: string, communication: CommunicationResponse) => {
		const { name, messageType, contentSubType, templateType } = templateDetails;
		if (templateType === TemplateType.Interactive) {
			if (!contentSubType) {
				throw new BadRequestException('contentSubType is not defined');
			} else {
				if (contentSubType === ContentSubType.Common) {
					if (!messageType) {
						throw new BadRequestException('messageType is not defined');
					}
				}
			}
		} else {
			if (!messageType) {
				throw new BadRequestException('messageType is not defined');
			}
		}

		let content: FynoContentPayload;
		if (templateDetails?.templateType === TemplateType.Simple) {
			content = {
				content: TemplateGenerator.generateSimpleContent(templateDetails),
			};
		} else {
			content = {
				content: {
					type: templateDetails?.templateType,
					content: TemplateGenerator.generateInteractiveContent(templateDetails),
				},
			};
		}

		const payload: FynoTemplatePayload = {
			name: name,
			event: {
				event_flow: {
					provider: {
						whatsapp: communication?.integrationId,
					},
				},
			},
			template: {
				template_id: providerTemplateId,
				channels: {
					whatsapp: content,
				},
				placeholders: {},
			},
		};
		return payload;
	},
	createExternalTemplate: async (payload: unknown, communication: CommunicationResponse) => {
		try {
			const response = await axios.post(`${FYNO_BASE_URL}/${communication?.fynoWorkSpaceId}/external-template/create`, payload, {
				headers: {
					Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
				},
			});
			return response.data;
		} catch (error) {
			throw new BadRequestException('Failed to call Fyno API');
		}
	},
	createFynoTemplate: async (payload: unknown, communication: CommunicationResponse) => {
		try {
			const request = await payload;
			const response = await axios.post(`${FYNO_BASE_URL}/${communication?.fynoWorkSpaceId}/notification`, request, {
				headers: {
					Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
					'Content-Type': 'application/json',
				},
			});
			return response.data;
		} catch (error) {
			console.log('error', error);
			throw new BadRequestException(error?.response?.data?._message);
		}
	},
	updateFynoTemplate: async (payload: unknown, name: string, communication: CommunicationResponse) => {
		try {
			const request = await payload;
			const response = await axios.put(`${FYNO_BASE_URL}/${communication?.fynoWorkSpaceId}/notification/${name}`, request, {
				headers: {
					Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
					'Content-Type': 'application/json',
				},
			});
			return response.data;
		} catch (error) {
			throw new BadRequestException(error?.response?.data?._message);
		}
	},
	bufferToStream: (buffer: Buffer) => {
		const stream = new Readable();
		stream.push(buffer);
		stream.push(null);
		return stream;
	},
	uploadFynoFile: async (file: FileDto, communication: CommunicationResponse) => {
		try {
			const formData = new FormData();
			const fileStream = TemplateGenerator.bufferToStream(file.data);
			formData.append('file', fileStream, {
				filename: file.name,
				contentType: file.mimetype,
			});
			formData.append('integration_id', communication?.integrationId);
			const response = await axios.post(`${FYNO_BASE_URL}/${communication?.fynoWorkSpaceId}/external-template/meta/upload`, formData, {
				headers: {
					...formData.getHeaders(),
					Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
				},
			});
			return response.data;
		} catch (error) {
			throw new BadRequestException('Failed to call Fyno API');
		}
	},
	getFynoTemplate: async (name: string, communication: CommunicationResponse) => {
		try {
			const response = await axios.get(`${FYNO_BASE_URL}/${communication?.fynoWorkSpaceId}/notification/${name}`, {
				headers: {
					Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
				},
			});
			return response?.data[0]?.template;
		} catch (error) {
			throw new BadRequestException(error?.response?.data);
		}
	},
	getExternalTemplate: async (name: string, communication: CommunicationResponse) => {
		try {
			const response = await axios.get(
				`${FYNO_BASE_URL}/${communication?.fynoWorkSpaceId}/external-template/edit/${communication?.integrationId}/${name}`,
				{
					headers: {
						Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
					},
				},
			);
			return response.data?.languages[0];
		} catch (error) {
			throw new BadRequestException(error?.response?.data);
		}
	},
	externalNotificationPayload: async (
		templateDetails: TemplateModel,
		externalPayload: ExternalTemplatePayload,
		notificationTemplateId: string,
		communication: CommunicationResponse,
	) => {
		let transformedSample = {};
		if (typeof externalPayload.languages[0].content.body !== 'string' && externalPayload.languages[0].content.body.sample?.length) {
			transformedSample = externalPayload.languages[0].content.body.sample.reduce((acc, item, index) => {
				acc[`$${index + 1}`] = `{{${item}}}`;
				return acc;
			}, {});
		} else {
			if (typeof externalPayload.languages[0].content.body === 'object' && 'text' in externalPayload.languages[0].content.body) {
				transformedSample = { $1: externalPayload.languages[0].content.body.text };
			} else {
				transformedSample = { $1: externalPayload.languages[0].content.body };
			}
		}
		const { name, language } = templateDetails;
		const payload = {
			name: name,
			event: {
				event_flow: {
					provider: {
						whatsapp: communication?.integrationId,
					},
				},
			},
			template: {
				template_id: notificationTemplateId,
				channels: {
					whatsapp: {
						content: {
							type: FynoWords[TemplateType.ExternalTemplate],
							whatsapp_template_name: name,
							language: language,
							wa_params: {
								...(externalPayload.languages[0].content as LanguageContent[]),
								body: transformedSample || '',
								external_template_data: {
									name: name,
									language: language,
									custom_name: communication?.customName,
									provide_name: FYNO_WHATSAPP_PROVIDER_NAME,
								},
							},
						},
					},
				},
				placeholders: {},
			},
		};
		return payload;
	},
	deleteExternalTemplate: async (name: string, templateId: string, language: string, communication: CommunicationResponse) => {
		try {
			const payload = {
				template_id: templateId,
				integration_id: communication?.integrationId,
				language,
			};
			const response = await axios.post(`${FYNO_BASE_URL}/${communication?.fynoWorkSpaceId}/external-template/${name}/delete`, payload, {
				headers: {
					Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
				},
			});
			return response;
		} catch (error) {
			throw new BadRequestException(error?.response?.data?._message);
		}
	},
	deleteFynoTemplate: async (name: string, communication: CommunicationResponse) => {
		try {
			const response = await axios.delete(`${FYNO_BASE_URL}/${communication?.fynoWorkSpaceId}/notification/${name}`, {
				headers: {
					Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
				},
			});
			return response;
		} catch (error) {
			throw new BadRequestException(error?.response?.data?._message);
		}
	},
	viberPayload: async (templateDetails: TemplateDto, providerTemplateId: string, communication: CommunicationResponse) => {
		const content: {
			viber: {
				content: {
					type: string;
					message_route: string;
					button?: {
						title: string;
						action: string;
					};
					text?: string;
					caption?: string;
					mediaUrl?: string;
					thumbnailUrl?: string;
					mediaDuration?: string;
				};
			};
		} = {
			viber: {
				content: {
					type: templateDetails.contentType,
					message_route: 'transcational',
				},
			},
		};
		if (templateDetails?.buttons?.length) {
			content.viber.content.button = {
				title: templateDetails.buttons[0].title,
				action: templateDetails.buttons[0].navigateScreen,
			};
		}

		switch (templateDetails.contentType) {
			case ViberContentType.Text:
				if (!templateDetails?.messageText) {
					throw new BadRequestException(TemplateMessage.messageTextRequired);
				} else {
					content.viber.content.text = templateDetails?.messageText;
				}
				break;
			case ViberContentType.Image:
				if (!templateDetails?.headerMediaUrl) {
					throw new BadRequestException(TemplateMessage.headerMediaUrlRequired);
				} else if (!templateDetails?.caption) {
					throw new BadRequestException(TemplateMessage.captionRequired);
				} else {
					content.viber.content.caption = templateDetails?.caption;
					content.viber.content.mediaUrl = templateDetails.headerMediaUrl;
				}
				break;
			case ViberContentType.Video:
				if (!templateDetails?.headerMediaUrl) {
					throw new BadRequestException(TemplateMessage.headerMediaUrlRequired);
				} else if (!templateDetails?.caption) {
					throw new BadRequestException(TemplateMessage.captionRequired);
				} else {
					content.viber.content.caption = templateDetails?.caption;
					content.viber.content.mediaUrl = templateDetails.headerMediaUrl;
					content.viber.content.thumbnailUrl = templateDetails.thumbnailUrl;
					content.viber.content.mediaDuration = templateDetails.mediaDuration;
				}
				break;
			case ViberContentType.File:
				if (!templateDetails?.headerMediaUrl) {
					throw new BadRequestException(TemplateMessage.headerMediaUrlRequired);
				} else if (!templateDetails?.caption) {
					throw new BadRequestException(templateDetails?.caption);
				} else {
					content.viber.content.caption = templateDetails?.messageText;
					content.viber.content.mediaUrl = templateDetails.headerMediaUrl;
				}
				break;
			default:
				throw new BadRequestException(`Unsupported content type: ${templateDetails.contentType}`);
		}
		const payload: FynoTemplatePayload = {
			name: templateDetails?.name,
			event: {
				event_flow: {
					provider: {
						viber: communication?.integrationId,
					},
				},
			},
			template: {
				template_id: providerTemplateId,
				channels: {
					viber: {
						content: content.viber.content,
					},
				},
				placeholders: {},
			},
		};
		return payload;
	},
};
