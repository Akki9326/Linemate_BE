import { EmailTemplateBase } from './email-template.base';

export class EmailTemplates extends EmailTemplateBase {
	static otpTemplate(otp: string) {
		return this.template(`Your OTP is ${otp}`);
	}

	static accountActivationEmail(companyName: string, userName: string, createdBy: string, emailAddress: string, password: string, loginLink: string) {
		const email = `<p>Dear ${userName},<br><br>${createdBy} has invited you to join the learning academy at ${companyName}. Your account details are as follows:<br>
    Username: ${emailAddress}<br>
    Password: ${password}<br><br>
    Please click on the button below to log in:</p>
    <p><a href="${loginLink}">Login</a></p>
    <p>Thanks and Regards,<br>${companyName} Team</p>
`;
		return this.template(email);
	}
	static chiefAdminAccountActivationEmail(userName: string, createdBy: string, emailAddress: string, password: string, loginLink: string) {
		const email = `<p>Dear ${userName},<br><br>${createdBy} has invited you to join the learning academy. Your account details are as follows:<br>
    Username: ${emailAddress}<br>
    Password: ${password}<br><br>
    Please click on the button below to log in:</p>
    <p><a href="${loginLink}">Login</a></p>
    <p>Thanks and Regards,<br>Linemate Team</p>
`;
		return this.template(email);
	}
	static resetPasswordEmail(userName: string, emailAddress: string, otp: string) {
		const email = ` <p>Dear ${userName},<br><br>We have received a request to reset your password for your account . Your account details are as follows:<br>
    Username: ${emailAddress}<br><br>
    Please use the following OTP to reset your password:<br>
    <strong>${otp}</strong></p>
    <p>This OTP is valid for a limited time. If you did not request a password reset, please ignore this email or contact our support team if you have any questions.</p>
    <p>Thanks and Regards,<br>Team</p>
`;
		return this.template(email);
	}
	static mobileLoginOTPEmail(userName: string, emailAddress: string, otp: string) {
		const email = `
        <p>Dear ${userName},</p>
        <p>We have received a request to log in to your account using an OTP. Your account details are as follows:</p>
        <p><strong>Username:</strong> ${emailAddress}</p>
        <p>Please use the following OTP to log in:</p>
        <strong>${otp}</strong></p>
        <p>This OTP is valid for a limited time. If you did not request this login, please ignore this email or contact our support team if you have any questions or concerns.</p>
        <p>Thank you,<br>Team</p>
    `;
		return email;
	}
	static errorReportEmail(firstName: string, lastName: string) {
		const email = `
    <p>Dear ${firstName},<br><br>${lastName} has generated an error report for the recent process conducted at. 
	
    <p>Thanks and Regards,<br>LineMate Team</p>
`;
		return this.template(email);
	}
}

export class EmailSubjects {
	static async accountActivationSubject(companyName: string) {
		return `Welcome to ${companyName}`;
	}

	static async chiefAdminAccountActivationSubject() {
		return `Welcome to Linemate`;
	}
	static mobileLoginEmailSubject = `Welcome to Linemate`;
	static resetPasswordEmailSubject = `Reset Your Linemate Account Password`;
}
