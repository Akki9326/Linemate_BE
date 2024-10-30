import { FYNO_AUTH_TOKEN, FYNO_BASE_URL, FYNO_VIBER_PROVIDER_ID, FYNO_WHATSAPP_PROVIDER_ID } from '@/config';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { CommunicationPayload } from '@/models/interfaces/communication.interface';
import axios from 'axios';
import { CommonHelper } from './common.helper';
import { WorkSpaceModel } from '@/models/db/workSpace.model';
import { Channel } from '@/models/enums/campaign.enums';

export const CommunicationHelper = {
	createWorkSpace: async (name: string, tenantId: number) => {
		const workSpaceModel = new WorkSpaceModel();
		const workSpaceName = `${name.trim().toLowerCase().replace(/\s+/g, '-')}` + '-' + `${await CommonHelper.generateRandomId(4)}`;
		const workSpace = await CommunicationHelper.createWorkSpaceInFyno(workSpaceName);
		workSpaceModel.fynoWorkSpaceName = workSpace.workspace_name;
		workSpaceModel.fynoWorkSpaceId = workSpace.wsid;
		workSpaceModel.tenantId = tenantId;
		await workSpaceModel.save();
		return workSpaceModel;
	},
	createWorkSpaceInFyno: async (name: string) => {
		try {
			const payload = {
				workspace: {
					workspace_name: name,
				},
			};
			const response = await axios.post(`${FYNO_BASE_URL}/workspaces`, payload, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
				},
			});
			return response.data;
		} catch (error) {
			throw new BadRequestException(error.response ? error.response.data._message : error.message);
		}
	},
	createOrUpdateIntegration: async (payload: CommunicationPayload, channel: Channel) => {
		try {
			let provideId: string;
			if (channel === Channel.whatsapp) {
				provideId = FYNO_WHATSAPP_PROVIDER_ID;
			} else if (channel === Channel.viber) {
				provideId = FYNO_VIBER_PROVIDER_ID;
			}

			const response = await axios.put(`${FYNO_BASE_URL}/${payload?.workSpaceId}/integrations/${provideId}`, payload, {
				headers: {
					Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
				},
			});
			return response.data;
		} catch (error) {
			throw new BadRequestException(error.response ? error.response.data._message : 'failed to create  integration');
		}
	},
	testIntegrationConfig: async (payload: CommunicationPayload, integrationId: string, workSpaceId: string) => {
		try {
			const response = await axios.post(`${FYNO_BASE_URL}/${workSpaceId}/integrations/${integrationId}/test`, payload, {
				headers: {
					Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
				},
			});
			return response.data;
		} catch (error) {
			throw new BadRequestException('invalid communication config');
		}
	},
};
