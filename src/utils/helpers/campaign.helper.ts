import { FYNO_AUTH_TOKEN, FYNO_BASE_URL, FYNO_WHATSAPP_WORKSPACE_ID } from '@/config';
import axios from 'axios';
import FormData from 'form-data';
import xlsx from 'xlsx';
import { UserModel } from '@models/db/users.model';
import { logger } from '../services/logger';

// Helper to generate Csv having users data

export const generateCsvFile = async campaigns => {
	const csvContent = [];
	csvContent.push(['distinct_id', 'whatsapp']);

	// Get all the users from the campaign
	for (let i = 0; i < campaigns?.length; i++) {
		const campaign = campaigns[i].userId;
		// Fetch details of user
		const user = await UserModel.findOne({
			where: {
				id: campaign,
			},
			attributes: ['mobileNumber'],
			raw: true,
		});
		if (user) {
			csvContent.push(['', user.mobileNumber]);
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
	return await uploadCsvOfFynoCampaign(form);
};

const uploadCsvOfFynoCampaign = async form => {
	// eslint-disable-next-line no-useless-catch
	try {
		// Call the Fyno API
		const response = await axios.post(`${FYNO_BASE_URL}/${FYNO_WHATSAPP_WORKSPACE_ID}/uploads`, form, {
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
		} else {
			logger.error('Error:', error.message);
		}
		throw error.response.data;
	}
};

export const createCampaignOnFyno = async (uploadId: string, campaignName: string) => {
	// eslint-disable-next-line no-useless-catch
	try {
		const response = await axios.post(
			`${FYNO_BASE_URL}/${FYNO_WHATSAPP_WORKSPACE_ID}/uploads/${uploadId}`,
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

export const removeCampaign = async (fynoCampaignId: string) => {
	try {
		const responst = await axios.delete(`${FYNO_BASE_URL}/${FYNO_WHATSAPP_WORKSPACE_ID}/uploads/${fynoCampaignId}`, {
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

export const renameFyonCampaign = async (fynoCampaignId: string, campaignName: string) => {
	try {
		const response = await axios.put(
			`${FYNO_BASE_URL}/${FYNO_WHATSAPP_WORKSPACE_ID}/uploads/${fynoCampaignId}`,
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

export const fireCampaign = async (fynoCampaignId: string) => {
	try {
		const response = await axios.post(`${FYNO_BASE_URL}/${FYNO_WHATSAPP_WORKSPACE_ID}/uploads/fireevent/${fynoCampaignId}`, null, {
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

export const getNotificationForCampaign = async (templateName: string) => {
	try {
		const getNotifictionDetails = await axios.get(`${FYNO_BASE_URL}/${FYNO_WHATSAPP_WORKSPACE_ID}/notification/${templateName}`, {
			headers: {
				Authorization: `Bearer ${FYNO_AUTH_TOKEN}`,
			},
		});

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

export const updateTemplateOnCampaign = async (fynoCampaignId: string, payload: object) => {
	try {
		const mapNotificationDetails = await axios.put(`${FYNO_BASE_URL}/${FYNO_WHATSAPP_WORKSPACE_ID}/uploads/${fynoCampaignId}`, payload, {
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

export const getCampaignPreview = async (fynoCamapignId: string) => {
	try {
		// View Campaign Preview
		const response = await axios.get(`${FYNO_BASE_URL}/${FYNO_WHATSAPP_WORKSPACE_ID}/uploads/preview/${fynoCamapignId}`, {
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

export const fynoCampaignOverview = async (previewData: { upload_name: string; event_id: string; version: string }) => {
	try {
		const response = await axios.get(
			`${FYNO_BASE_URL}/v3/${FYNO_WHATSAPP_WORKSPACE_ID}/event-analytics/channel_engagement?campaign_name=${previewData.upload_name}&event_id=${previewData.event_id}&version=${previewData.version}`,
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
