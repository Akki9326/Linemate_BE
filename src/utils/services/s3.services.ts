import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, CopyObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // For presigned URLs
import { ServerException } from '@/exceptions/ServerException';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, BUCKET } from '@config';

export default class S3Services {
	private readonly s3: S3Client;

	private ConfigService = {
		credentials: {
			accessKeyId: AWS_ACCESS_KEY_ID,
			secretAccessKey: AWS_SECRET_ACCESS_KEY,
		},
		region: AWS_REGION,
	};

	constructor() {
		this.s3 = new S3Client(this.ConfigService); // Initialize the S3Client instance with ConfigService
	}

	// For connection to S3
	getS3() {
		return this.s3;
	}

	/**
	 * Upload images to S3 bucket
	 * @param file = Image file buffer
	 * @param name = Name of image file
	 * @param mimeType = File mime type
	 * @param filePermission = File permission
	 */
	public async uploadS3(file: Buffer, name: string, mimeType: string, filePermission: 'private' | 'public-read' = 'public-read'): Promise<string> {
		try {
			// Create a PutObjectCommand with valid ACL value
			const command = new PutObjectCommand({
				Bucket: BUCKET,
				Key: name,
				Body: file,
				ContentType: mimeType,
				ACL: filePermission, // Ensure filePermission is one of the allowed values
			});

			await this.s3.send(command);

			// Construct the URL of the uploaded file
			return `https://${BUCKET}.s3.${AWS_REGION}.amazonaws.com/${name}`;
		} catch (error) {
			throw new ServerException(error, `Error Uploading file`);
		}
	}

	/**
	 * Delete file from S3 bucket
	 * @param key = File Name
	 */
	public async deleteFileFromS3(key: string) {
		try {
			const command = new DeleteObjectCommand({
				Bucket: BUCKET,
				Key: key,
			});

			await this.s3.send(command);
		} catch (error) {
			throw new ServerException(error, `Error while delete file`);
		}
	}

	/**
	 * Get Pre Signed URL of File from S3 bucket
	 * @param key = File Name
	 * @param expires = URL expiration time in seconds
	 * @param contentType = MIME type for the response
	 */
	public async generatePresignedUrl(key: string, expires: number, contentType: string | null = null): Promise<string> {
		try {
			const command = new GetObjectCommand({
				Bucket: BUCKET,
				Key: key,
				ResponseContentDisposition: contentType ? `${contentType}; filename="${key}"` : undefined,
			});

			const url = await getSignedUrl(this.s3, command, { expiresIn: expires });
			return url;
		} catch (error) {
			throw new ServerException(error, `Error Generating Presigned URL`);
		}
	}
	/**
	 * Move image local to destination
	 * @param url = Image URL
	 * @param destinationPath = Destination path where we want to move
	 * @param filePermission = File permissions default permissions is public
	 */
	public async moveFileByUrl(url: string, destinationPath: string): Promise<string> {
		try {
			const parts = url.split('/'); // Split the URL by '/'
			const keyParts = parts.slice(3); // Extract the Bucket and Key
			const sourceKey = keyParts.join('/');

			const imageName = sourceKey.split('/');

			const destinationKey = `${destinationPath}/${imageName[imageName.length - 1]}`;

			const copyParams = {
				Bucket: BUCKET,
				CopySource: `${BUCKET}/${sourceKey}`,
				Key: destinationKey,
				ACL: ObjectCannedACL.public_read,
			};
			await this.s3.send(new CopyObjectCommand(copyParams));

			const newImageUrl = `https://${BUCKET}.s3.${AWS_REGION}.amazonaws.com/${destinationKey}`;

			await this.deleteFileFromS3(sourceKey);
			return newImageUrl;
		} catch (error) {
			throw new ServerException(error, `Error Geting while file move`);
		}
	}
}
