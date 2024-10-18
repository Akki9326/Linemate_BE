import {
	FYNO_AUTH_TOKEN,
	FYNO_BASE_URL,
	// FYNO_WHATSAPP_CUSTOM_NAME,
	// FYNO_WHATSAPP_INTEGRATION_ID,
	// FYNO_WHATSAPP_PROVIDER_ID,
	// FYNO_WHATSAPP_PROVIDER_NAME,
	FYNO_WHATSAPP_WORKSPACE_ID,
} from '@/config';
import axios from 'axios';
import FormData from 'form-data';
// import fs from 'fs';
import xlsx from 'xlsx';
import { UserModel } from '@models/db/users.model';
import { logger } from '../services/logger';

// Helper to generate Csv having users data

export const generateCsvFile = async campaigns => {
	const csvContent = [];
	csvContent.push(['DISTINCT_ID', 'WHATSAPP']);

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
		throw error;
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
