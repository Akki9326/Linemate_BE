import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { CommunicationModel } from '@/models/db/communication.mode';
import { CommunicationDto } from '@/models/dtos/communication.dto';
import { Channel } from '@/models/enums/campaign.enums';
import { CommunicationPayload } from '@/models/interfaces/communication.interface';
import { CommunicationMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import { CommonHelper } from '@/utils/helpers/common.helper';
import { CommunicationHelper } from '@/utils/helpers/communication.helper';
import { TenantService } from './tenant.service';
import { WorkSpaceModel } from '@/models/db/workSpace.model';
import { FYNO_VIBER_NAME } from '@/config';

export class CommunicationService {
	private communication = DB.CommunicationModel;
	private workSpaceModel = DB.WorkSpaceModel;
	private tenantService = new TenantService();

	constructor() { }

	public async add(communicationDetails: CommunicationDto, userId: number) {
		const tenantDetails = await this.validateTenant(communicationDetails?.tenantId);
		const existingWorkSpace = await this.workSpaceModel.findOne({ where: { tenantId: communicationDetails?.tenantId, isDeleted: false } });
		const workSpaceDetails: { workSpaceId: string; id: string | number } = { workSpaceId: '', id: '' };
		if (!existingWorkSpace) {
			const workSpace = await CommunicationHelper.createWorkSpace(tenantDetails?.name, tenantDetails.id);
			workSpaceDetails.workSpaceId = workSpace.fynoWorkSpaceId;
			workSpaceDetails.id = workSpace.id;
		} else {
			workSpaceDetails.workSpaceId = existingWorkSpace.fynoWorkSpaceId;
			workSpaceDetails.id = existingWorkSpace.id;
		}
		const existingCommunication = await this.communication.findOne({
			where: { workSpaceId: workSpaceDetails?.id, channel: communicationDetails.channel, isDeleted: false },
		});
		if (existingCommunication) {
			throw new BadRequestException(`${communicationDetails.channel} communication already exists for this tenant`);
		} else {
			const customName = `${tenantDetails?.name.trim().toLowerCase().replace(/\s+/g, '_')}` + `${await CommonHelper.generateRandomId(4)}`;
			const payloadResponse = await this.buildCommunicationPayload(communicationDetails, workSpaceDetails.workSpaceId, customName);
			const integrationResponse = await CommunicationHelper.createOrUpdateIntegration(payloadResponse, communicationDetails.channel);
			const communicationModel = new this.communication();
			const communication = await this.createUpdateCommunicationRecord(
				{ customName: payloadResponse.custom_name, ...communicationDetails },
				workSpaceDetails.id,
				integrationResponse?.id,
				userId,
				communicationModel,
			);
			return communication.id;
		}
	}

	public async update(communicationDetails: CommunicationDto, communicationId: number, userId: number) {
		const existingCommunication = await this.communication.findOne({
			where: { id: communicationId, channel: communicationDetails.channel, isDeleted: false },
		});
		if (!existingCommunication) {
			throw new BadRequestException(`${communicationDetails.channel} communication not exists for this tenant`);
		}
		const fynoWorkSpaceDetails = await this.workSpaceModel.findOne({
			where: { id: existingCommunication?.workSpaceId, isDeleted: false },
		});
		const payloadResponse = await this.buildCommunicationPayload(
			communicationDetails,
			fynoWorkSpaceDetails.fynoWorkSpaceId,
			existingCommunication?.customName,
		);
		await CommunicationHelper.createOrUpdateIntegration({ ...payloadResponse }, communicationDetails.channel);
		const communication = await this.createUpdateCommunicationRecord(
			communicationDetails,
			existingCommunication.workSpaceId,
			existingCommunication?.integrationId,
			userId,
			existingCommunication,
		);
		return communication.id;
	}

	private async validateTenant(tenantId: number) {
		if (!tenantId) {
			throw new BadRequestException(TenantMessage.requiredTenantId);
		}
		const tenantDetails = await this.tenantService.one(tenantId);
		if (!tenantDetails) {
			throw new BadRequestException(TenantMessage.tenantNotFound);
		}
		return tenantDetails;
	}

	private async validateRequiredFields(fields: { [key: string]: string }) {
		for (const [key, value] of Object.entries(fields)) {
			if (!value) {
				throw new BadRequestException(`${key} is required`);
			}
		}
	}

	private async buildCommunicationPayload(communicationDetails: CommunicationDto, workSpaceId: string, customName: string) {
		let payload = {} as CommunicationPayload;
		switch (communicationDetails?.channel) {
			case Channel.whatsapp:
				payload = await this.populateWhatsAppPayload(communicationDetails, workSpaceId, customName);
				break;
			case Channel.viber:
				payload = await this.populateViberPayload(communicationDetails, workSpaceId, customName);
				break;
			default:
				throw new BadRequestException('Unsupported communication channel');
		}
		return payload;
	}

	private async populateWhatsAppPayload(communicationDetails: CommunicationDto, workSpaceId: string, customName: string) {
		await this.validateRequiredFields({
			fromNumberId: communicationDetails.fromNumberId,
			wabaId: communicationDetails.wabaId,
			accessToken: communicationDetails.accessToken,
		});
		const payload: CommunicationPayload = {
			config: {
				from: communicationDetails.fromNumberId,
				waba_id: communicationDetails.wabaId,
				'access-token': communicationDetails.accessToken,
			},
			integration_id: '',
			custom_name: customName,
			edited_enc_keys: ['access-token'],
			workSpaceId: workSpaceId,
		};
		return payload;
	}

	private async populateViberPayload(communicationDetails: CommunicationDto, workSpaceId: string, customName: string) {
		await this.validateRequiredFields({
			domain: communicationDetails.domain,
			sender: communicationDetails.sender,
			accessToken: communicationDetails.accessToken,
		});
		const payload: CommunicationPayload = {
			config: {
				provider: FYNO_VIBER_NAME,
				domain: communicationDetails.domain,
				sender: communicationDetails.sender,
				apikey: communicationDetails.accessToken,
			},
			integration_id: '',
			custom_name: customName,
			edited_enc_keys: ['apikey'],
			workSpaceId: workSpaceId,
		};
		return payload;
	}

	private async createUpdateCommunicationRecord(
		communicationDetails: CommunicationDto,
		workSpaceId: number,
		integrationId: string,
		userId: number,
		communicationModel: CommunicationModel,
	) {
		communicationModel.fromNumberId = communicationDetails.fromNumberId;
		communicationModel.wabaId = communicationDetails.wabaId;
		communicationModel.domain = communicationDetails.domain;
		communicationModel.sender = communicationDetails.sender;
		communicationModel.accessToken = communicationDetails.accessToken;
		communicationModel.channel = communicationDetails.channel;
		communicationModel.customName = communicationDetails.customName;
		communicationModel.workSpaceId = workSpaceId;
		communicationModel.integrationId = integrationId;
		communicationModel.createdBy = userId;
		communicationModel.updatedBy = userId;
		await communicationModel.save();
		return communicationModel;
	}

	public async getWorkSpaceDetails(tenantId: number) {
		const workSpace = await this.workSpaceModel.findOne({ where: { tenantId: tenantId, isDeleted: false } });
		if (!workSpace) {
			throw new BadRequestException(CommunicationMessage.workSpaceNotFound);
		}
		return workSpace;
	}
	public async getCommunicationDetails(tenantId: number, attributes: string[], workSpace: WorkSpaceModel, channel: Channel) {
		const communication = await this.communication.findOne({
			where: {
				workSpaceId: workSpace.id,
				isDeleted: false,
				channel,
			},
			attributes,
		});

		return communication;
	}
	public async findIntegrationDetails(tenantId: number, channel: Channel) {
		const attributes = ['fromNumberId', 'wabaId', 'channel', 'domain', 'sender', 'accessToken', 'integrationId', 'customName'];
		const workSpace = await this.getWorkSpaceDetails(tenantId);
		const communication = await this.getCommunicationDetails(tenantId, attributes, workSpace, channel);
		const payload: CommunicationPayload = {
			config: {
				from: communication.fromNumberId,
				waba_id: communication.wabaId,
			},
		};
		if (channel === Channel.whatsapp) {
			await CommunicationHelper.testIntegrationConfig(payload, communication.integrationId, workSpace.fynoWorkSpaceId);
		}
		return { integrationId: communication.integrationId, fynoWorkSpaceId: workSpace.fynoWorkSpaceId, customName: communication.customName };
	}

	public async one(tenantId: number, channel: Channel) {
		const attributes = ['id', 'fromNumberId', 'wabaId', 'channel', 'domain', 'sender', 'accessToken'];
		const workSpace = await this.getWorkSpaceDetails(tenantId);
		const communication = await this.getCommunicationDetails(tenantId, attributes, workSpace, channel);
		return communication;
	}
}
