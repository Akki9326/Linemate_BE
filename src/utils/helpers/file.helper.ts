import { AWS_S3_FILE_URL } from '@/config';

export const FileHelper = {
	getContentUrl: async (tenantId: number, contentId: number, fileName: string) => {
		return `${AWS_S3_FILE_URL}/tenants/${tenantId}/contents/${contentId}/${fileName}`;
	},
};
