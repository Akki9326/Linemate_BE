import { EmailTemplateBase } from './email-template.base';

export class EmailTemplates extends EmailTemplateBase {
  static otpTemplate(otp: string) {
    return this.template(`Your OTP is ${otp}`);
  }

  static resetPasswordEmail(name: string, resetLink: string) {
    const email = `<p>Hello <span>${name}</span>,</p><br/>
    <p> You recently requested to reset your password for your IPV account. Please click the link below to set a new password: </p>
  
    <a href="${resetLink}"> ${resetLink}</a>

    <p>This link is only valid for 2 hours. If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>

    <p>If you have any questions, feel free to reach out to our support team.</p>
   <br/>
    <p>
    Regards, <br/>
    IPV Team
    </p>
    `;
    return this.template(email);
  }

  static accountActivationEmail(name: string, resetLink: string) {
    const email = `
    <p>Dear ${name},<br><br>It is with immense pleasure that we at Inflection Point Ventures extend a warm welcome to you as our esteemed partner. Your commitment to fostering growth and innovation aligns perfectly with our mission and we are excited about the synergy that our collaboration will bring.<br><br>We are particularly thrilled to introduce you to a new asset class that not only complements your current offerings but also opens up a novel revenue stream for your business. This strategic partnership is poised to unlock unparalleled value for both our networks and we are committed to providing you with all the necessary support to make this venture a resounding success.</p>
    <p>Please click on the following link to activate your Web Login-<a href="${resetLink}"> ${resetLink}</a>
    <br>We eagerly anticipate the opportunities that lie ahead and are confident that together, we will achieve remarkable milestones. Please feel free to reach out to us to discuss our next steps or any queries you may have.<br><br>Once again, welcome aboard, and here&rsquo;s to a prosperous partnership!</p>
    <p>Thanks and Regards<br>IPV Team</p>
    `;
    return this.template(email);
  }
  static exceptionEmail(member: object, exceptionMessage: string, track: String) {
    const email = `<p>Dear <strong>Admin</strong>,</p>

    <p>I hope this message finds you well. During our recent asynchronous operation, we encountered an exception that has interrupted our process. We need your expertise to diagnose and resolve this issue promptly.</p>

    <p><strong>Exception Details:</strong></p>
    <ul>
        <li><strong>Member Details:</strong> ${JSON.stringify(member)}</li>
        <li><strong>Error Message:</strong> ${exceptionMessage}</li>
        <li><strong>Stack Trace:</strong> ${track}</li>
    </ul>

    <p>Please find the details above for your review. Your insights would be invaluable in identifying the root cause and suggesting potential solutions. Could we possibly discuss this at your earliest convenience? If you need any further information or specific logs, please let me know, and I will provide them as soon as possible.</p>

    <p>Thank you for your attention to this matter and for your continued support.</p>

    <p>  Regards, <br/>
    IPV Team</p>
    `;
    return this.template(email);
  }
static async investmentEmail(member: { name: string }) {
    const email = `<p>Dear <strong>${member.name}</strong>,</p>

    <p>We hope this message finds you well. We're pleased to provide you with a detailed overview of your investment portfolio. Please find the detailed report attached to this email.</p>

    <p>If you have any questions or need further assistance, feel free to reach out to your IPV RM. We are always here to help you.</p>

    <p>Thank you for trusting IPV with your investment needs. Together, let's achieve your financial goals.</p>

    <p>Warm regards,<br/>
    IPV Team</p>
    `;
    return this.template(email);
}
}


export class EmailSubjects {
  static resetPasswordEmail = `Reset Your IPV Account Password`;
  static accountActivationEmail = `A Warm Welcome to Our New Partnership!`;
  static exceptionEmail = `Member Exception in IPV`;
}
