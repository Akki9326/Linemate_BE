// import multer from 'multer';
// import multerS3 from 'multer-s3';
// import AWS from 'aws-sdk';
// import moment from 'moment';
// import { Request, Response, NextFunction } from 'express';
// import {
//     AWS_ACCESS_KEY_ID,
//     AWS_SECRET_ACCESS_KEY,
//     AWS_REGION,
//     BUCKET
// } from '@config'

// export class ProfileUploadS3 {
//     private s3: AWS.S3;
//     constructor() {
//         AWS.config.update({
//             accessKeyId: AWS_ACCESS_KEY_ID,
//             secretAccessKey: AWS_SECRET_ACCESS_KEY,
//             region: AWS_REGION,
//         });

//         this.s3 = new AWS.S3();
//     }

//     public getProfileUpload() {
//         return multer({
//             storage: multerS3({
//                 s3: this.s3,
//                 bucket: BUCKET,
//                 // acl: 'public-read',
//                 contentType: multerS3.AUTO_CONTENT_TYPE,
//                 key: (req, file, cb) => {
//                     const dirName = "item/";
//                     cb(
//                         null,
//                         "linemate/" +
//                         dirName +
//                         file.originalname.split(".").shift() +
//                         "-" +
//                         moment().unix() +
//                         Math.floor(1000 + Math.random() * 9000) +
//                         "." +
//                         file.originalname.split(".").pop()
//                     );
//                 },
//             }),
//         });
//     }
// }

import multer, { Multer } from 'multer';
import moment from 'moment';
import path from 'path';
import { RequestHandler } from 'express';

export class ProfileUploadLocal {
	private multerInstance: Multer;

	constructor() {
		const storage = multer.diskStorage({
			destination: function (req, file, cb) {
				cb(null, 'public/'); // Set your destination folder here
			},
			filename: function (req, file, cb) {
				cb(null, file.fieldname + '-' + moment().unix() + Math.floor(1000 + Math.random() * 9000) + path.extname(file.originalname));
			},
		});

		this.multerInstance = multer({ storage: storage });
	}

	// Method to handle single file upload
	public single(fieldName: string): RequestHandler {
		return this.multerInstance.single(fieldName);
	}
}
