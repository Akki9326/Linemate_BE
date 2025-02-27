import { SMTP_FROM, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from '@/config';

import nodemailer from 'nodemailer';

export class Email {
	static async sendEmail(to, subject, html, attachments = null) {
		return new Promise((resolve, reject) => {
			if (SMTP_HOST) {
				const transporter = nodemailer.createTransport({
					host: SMTP_HOST,
					port: SMTP_PORT,
					auth: {
						user: SMTP_USER,
						pass: SMTP_PASS,
					},
					tls: { rejectUnauthorized: false },
				});

				transporter
					.sendMail({
						from: SMTP_FROM,
						to: to,
						subject: subject,
						html: `${html}`,
						attachments: attachments,
					})
					.then(res => {
						resolve(res);
					})
					.catch(error => {
						reject(error);
					});
			} else {
				reject(`Host not available`);
			}
		});
	}
}
