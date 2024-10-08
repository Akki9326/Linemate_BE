import * as XLSX from 'xlsx';
import S3Services from '@/utils/services/s3.services';

export default class ExcelService {
	public s3Service = new S3Services();

	// Function to create Excel file and upload to S3 without saving locally
	public async createAndUploadExcelFile(data, fileName: string): Promise<string> {
		try {
			// Create a new workbook
			const workbook = XLSX.utils.book_new();

			// Convert the data array to a worksheet
			const worksheet = XLSX.utils.json_to_sheet(data);

			// Append the worksheet to the workbook
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Errors');

			// Generate Excel file buffer
			const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

			// Upload the Excel file buffer to S3
			const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
			const s3Url = await this.s3Service.uploadS3(excelBuffer, fileName, mimeType);

			return s3Url;
		} catch (error) {
			throw new Error(`Failed to create or upload Excel file: ${error.message}`);
		}
	}
}
