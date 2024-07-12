/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServerException } from '@/exceptions/ServerException';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, BUCKET } from '@config';
import { S3 } from 'aws-sdk';

export default class S3Services {
	private readonly s3: S3;

	private ConfigService = {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY, // Assign AWS_SECRET_ACCESS_KEY here
		region: AWS_REGION,
	};

	constructor() {
		this.s3 = new S3(this.ConfigService); // Initialize the S3 instance with ConfigService
	}

	// For connection to S3
	getS3() {
		return new S3(this.ConfigService);
	}

	/**
	 * Upload images on S3 bucket
	 * @param file = Image file buffer
	 * @param bucket = Path of bucket/folder
	 * @param name = Name of image file
	 * @param mimeType = File mime type
	 */
	public async uploadS3(file, name: string, mimeType: string, filePermission: string = 'private'): Promise<any> {
		try {
			const params = {
				Bucket: BUCKET,
				Key: name,
				Body: file,
				ContentType: mimeType,
				ACL: filePermission,
			};

			return new Promise((resolve, reject) => {
				this.s3.upload(params, (err, data) => {
					if (err) {
						console.log(err);
						reject(err.message);
					}
					resolve(data);
				});
			});
		} catch (error) {
			throw new ServerException(error, `Error Uploading file`);
		}
	}

	/**
	 * Delete file from S3 bucket
	 * @param key = File Name
	 * @param bucketName = Bucket/Folder path in S3
	 */
	public async deleteFileFromS3(key: string) {
		const params = {
			Bucket: BUCKET,
			Key: key,
		};
		this.s3.deleteObject(params, function (err) {
			if (err) console.log(err, err.stack);
		});
		return;
	}
	/**
	 * Get Pre Signed URL of File from S3 bucket
	 * @param key = File Name
	 * @param expires = Presigned URL
	 * @param bucketName = Bucket/Folder path in S3
	 * @param contentType
	 */
	public async generatePresignedUrl(key: string, expires: number, contentType = null) {
		const params = {
			Bucket: BUCKET,
			Key: key,
			Expires: expires,
		};
		if (contentType != null) {
			params['ResponseContentDisposition'] = `${contentType}; filename="${key}"`;
		}
		return this.s3.getSignedUrlPromise('getObject', params);
	}
}
