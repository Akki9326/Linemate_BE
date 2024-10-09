import * as XLSX from 'xlsx';
// import fs from 'fs';
// import path from 'path';
// import S3Services from '@/utils/services/s3.services';

export default class ExcelService {
	// public s3Service = new S3Services();

	// Function to create Excel file and upload to S3 without saving locally
	public async createAndUploadExcelFile(data) {
		try {
			// Create a new workbook
			const workbook = XLSX.utils.book_new();

			// Convert the data array to a worksheet
			const worksheet = XLSX.utils.json_to_sheet(data);

			// Append the worksheet to the workbook
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Errors');

			// Generate Excel file buffer
			const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

			return excelBuffer;
		} catch (error) {
			throw new Error(`Failed to create or upload Excel file: ${error.message}`);
		}
	}
}
