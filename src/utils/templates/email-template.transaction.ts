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
	static errorReportEmail(firstName: string, lastName: string, errorFileLink: string) {
		const email = `
    <p>Dear ${firstName},<br><br>${lastName} has generated an error report for the recent process conducted at. 
    Please find the details of the errors by clicking on the link below to download the report:<br><br>
    
    <a href="${errorFileLink}" target="_blank" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #4CAF50; text-align: center; text-decoration: none; border-radius: 5px;">Download Error Report</a></p>

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
	static resetPasswordEmailSubject = `Reset Your Linemate Account Password`;
}
