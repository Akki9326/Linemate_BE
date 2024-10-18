import DB from '@/databases';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { CommunicationModel } from '@/models/db/communication.mode';
import { TenantModel } from '@/models/db/tenant.model';
import { CommunicationDto } from '@/models/dtos/communication.dto';
import { Channel } from '@/models/enums/campaign.enums';
import { CommunicationPayload } from '@/models/interfaces/communication.interface';
import { TenantMessage } from '@/utils/helpers/app-message.helper';
import { CommonHelper } from '@/utils/helpers/common.helper';
import { CommunicationHelper } from '@/utils/helpers/communication.helper';
import { TenantService } from './tenant.service';

export class CommunicationService {
	private communication = DB.CommunicationModel;
	private workSpaceModel = DB.WorkSpaceModel;
	private tenantService = new TenantService();

	constructor() {}

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
			throw new BadRequestException(`${communicationDetails.channel} Communication already exists for this tenant`);
		} else {
			const customName = `${tenantDetails?.name.trim().toLowerCase().replace(/\s+/g, '-')}` + `${await CommonHelper.generateRandomId(4)}`;
			const payloadResponse = await this.buildCommunicationPayload(tenantDetails, communicationDetails, workSpaceDetails.workSpaceId, customName);
			const integrationResponse = await CommunicationHelper.createOrUpdateIntegration(payloadResponse);
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
		const tenantDetails = await this.validateTenant(communicationDetails?.tenantId);
		const existingCommunication = await this.communication.findOne({
			where: { id: communicationId, channel: communicationDetails.channel, isDeleted: false },
		});
		const fynoWorkSpaceDetails = await this.workSpaceModel.findOne({
			where: { id: existingCommunication?.workSpaceId, isDeleted: false },
		});
		if (!existingCommunication) {
			throw new BadRequestException(`${communicationDetails.channel} Communication not exists for this tenant`);
		}
		const payloadResponse = await this.buildCommunicationPayload(
			tenantDetails,
			communicationDetails,
			fynoWorkSpaceDetails.fynoWorkSpaceId,
			existingCommunication?.customName,
		);
		await CommunicationHelper.createOrUpdateIntegration({ ...payloadResponse, integration_id: existingCommunication?.integrationId });
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
			throw new BadRequestException(TenantMessage.tenantNotFound);
		}
		const tenantDetails = await this.tenantService.one(tenantId);
		if (!tenantDetails) {
			throw new BadRequestException(TenantMessage.tenantNotFound);
		}
		return tenantDetails;
	}

	private async buildCommunicationPayload(
		tenantDetails: TenantModel,
		communicationDetails: CommunicationDto,
		workSpaceId: string,
		customName: string,
	) {
		let payload = {} as CommunicationPayload;
		switch (communicationDetails?.channel) {
			case Channel.whatsapp:
				payload = await this.populateWhatsAppPayload(tenantDetails, communicationDetails, workSpaceId, customName);
				break;
			case Channel.viber:
				payload = await this.populateViberPayload(tenantDetails, communicationDetails, workSpaceId, customName);
				break;
			default:
				throw new BadRequestException('Unsupported communication channel');
		}
		return payload;
	}

	private async populateWhatsAppPayload(tenantDetails: TenantModel, communicationDetails: CommunicationDto, workSpaceId: string, customName: string) {
		const payload: CommunicationPayload = {
			config: {
				from: communicationDetails.fromNumber,
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

	private async populateViberPayload(tenantDetails: TenantModel, communicationDetails: CommunicationDto, workSpaceId: string, customName: string) {
		const payload: CommunicationPayload = {
			config: {
				provider: communicationDetails.viberProvider,
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
		communicationModel.fromNumber = communicationDetails.fromNumber;
		communicationModel.wabaId = communicationDetails.wabaId;
		communicationModel.viberProvider = communicationDetails.viberProvider;
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
}
