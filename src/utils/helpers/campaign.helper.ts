import { FYNO_AUTH_TOKEN, FYNO_BASE_URL } from '@/config';
import axios from 'axios';
import FormData from 'form-data';
import xlsx from 'xlsx';
// import { UserModel } from '@models/db/users.model';
import { logger } from '../services/logger';
import { BadRequestException } from '@/exceptions/BadRequestException';

// Helper to generate Csv having users data

export const generateCsvFile = async (workspaceId, campaigns) => {
	const csvContent = [];
	csvContent.push(['distinct_id', 'whatsapp']);

	// Get all the users from the campaign
	// for (let i = 0; i < campaigns?.length; i++) {
	// 	const campaign = campaigns[i].userId;
	// 	// Fetch details of user
	// 	const user = await UserModel.findOne({
	// 		where: {
	// 			id: campaign,
	// 		},
	// 		attributes: ['mobileNumber'],
	// 		raw: true,
	// 	});
	// 	if (user) {
	// 		csvContent.push(['', user.mobileNumber]);
	// 	}
	// }

	for (let i = 0; i < campaigns?.length; i++) {
		const campaign = campaigns[i].mobileNumber;
		if (campaign) {
			csvContent.push(['', campaign]);
		}
	}

	xlsx.utils.book_new();
	const worksheet = xlsx.utils.aoa_to_sheet(csvContent);
	const csvData = xlsx.utils.sheet_to_csv(worksheet);

	const form = new FormData();
	form.append('file', Buffer.from(csvData), {
		filename: 'campaign_data.csv',
		contentType: 'text/csv',
	});
	form.append('validate_channels', 'true');
	return await uploadCsvOfFynoCampaign(workspaceId, form);
};

const uploadCsvOfFynoCampaign = async (workspaceId, form) => {
	// eslint-disable-next-line no-useless-catch
	try {
		// Call the Fyno API
		const response = await axios.post(`${FYNO_BASE_URL}/${workspaceId}/uploads`, form, {
			headers: {
				...form.getHeaders(),
				Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
			},
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error('Error response data:', error.response?.data);
			logger.error('Error status code:', error.response?.status);

			throw error.response.data;
		} else {
			logger.error('Error:', error.message);
			throw error;
		}

	}
};

export const createCampaignOnFyno = async (workspaceId: string, uploadId: string, campaignName: string) => {
	// eslint-disable-next-line no-useless-catch
	try {
		const response = await axios.post(
			`${FYNO_BASE_URL}/${workspaceId}/uploads/${uploadId}`,
			{
				uploadname: campaignName,
			},
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
				},
			},
		);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error('Error response data:', error.response?.data);
			logger.error('Error status code:', error.response?.status);
		} else {
			logger.error('Error:', error.message);
		}
		throw error;
	}
};

export const removeCampaign = async (workspaceId: string, fynoCampaignId: string) => {
	try {
		const responst = await axios.delete(`${FYNO_BASE_URL}/${workspaceId}/uploads/${fynoCampaignId}`, {
			headers: {
				Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
			},
		});
		return responst.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error('Error response data:', error.response?.data);
			logger.error('Error status code:', error.response?.status);
		} else {
			logger.error('Error:', error.message);
		}
		throw error;
	}
};

export const renameFyonCampaign = async (workspaceId: string, fynoCampaignId: string, campaignName: string) => {
	try {
		const response = await axios.put(
			`${FYNO_BASE_URL}/${workspaceId}/uploads/${fynoCampaignId}`,
			{
				uploadname: campaignName,
			},
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
				},
			},
		);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error('Error response data:', error.response?.data);
			logger.error('Error status code:', error.response?.status);
		} else {
			logger.error('Error:', error.message);
		}
		throw error;
	}
};

export const fireCampaign = async (workspaceId: string, fynoCampaignId: string) => {
	try {
		const response = await axios.post(`${FYNO_BASE_URL}/${workspaceId}/uploads/fireevent/${fynoCampaignId}`, null, {
			headers: {
				Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
			},
		});

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error('Error response data:', error.response?.data);
			logger.error('Error status code:', error.response?.status);
		} else {
			logger.error('Error:', error.message);
		}
		throw error;
	}
};

export const getNotificationForCampaign = async (workspaceId: string, templateName: string) => {
	try {
		const getNotifictionDetails = await axios.get(`${FYNO_BASE_URL}/${workspaceId}/notification/${templateName}`, {
			headers: {
				Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
			},
		});

		if (getNotifictionDetails.data.length) {
			const payload = {
				mappings: {
					event: {
						event_name: getNotifictionDetails.data[0].event_name,
						event_id: getNotifictionDetails.data[0].event_id,
						to: {
							whatsapp: '{{whatsapp}}',
						},
					},
				},
			};
			return payload;
		} else {
			throw new BadRequestException(`Notification Details not found for ${templateName}`);
		}

	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error('Error response data:', error.response?.data);
			logger.error('Error status code:', error.response?.status);
		} else {
			logger.error('Error:', error.message);
		}
		throw error;
	}
};

export const updateTemplateOnCampaign = async (workspaceId: string, fynoCampaignId: string, payload: object) => {
	try {
		const mapNotificationDetails = await axios.put(`${FYNO_BASE_URL}/${workspaceId}/uploads/${fynoCampaignId}`, payload, {
			headers: {
				Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
				'Content-Type': 'application/json',
			},
		});
		return mapNotificationDetails.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error('Error response data:', error.response?.data);
			logger.error('Error status code:', error.response?.status);
		} else {
			logger.error('Error:', error.message);
		}
		throw error;
	}
};

export const getCampaignPreview = async (workspaceId: string, fynoCamapignId: string) => {
	try {
		// View Campaign Preview
		const response = await axios.get(`${FYNO_BASE_URL}/${workspaceId}/uploads/preview/${fynoCamapignId}`, {
			headers: {
				Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
			},
		});
		const version = 'live';
		return {
			upload_name: response.data.upload_name,
			event_id: response.data.mappings.event.event_id,
			version: version,
		};
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error('Error response data:', error.response?.data);
			logger.error('Error status code:', error.response?.status);
		} else {
			logger.error('Error:', error.message);
		}
		throw error;
	}
};

export const fynoCampaignOverview = async (workspaceId: string, previewData: { upload_name: string; event_id: string; version: string }) => {
	try {
		const response = await axios.get(
			`${FYNO_BASE_URL}/v3/${workspaceId}/event-analytics/channel_engagement?campaign_name=${previewData.upload_name}&event_id=${previewData.event_id}&version=${previewData.version}`,
			{
				headers: {
					Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
				},
			},
		);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error('Error response data:', error.response?.data);
			logger.error('Error status code:', error.response?.status);
		} else {
			logger.error('Error:', error.message);
		}
		throw error;
	}
};
