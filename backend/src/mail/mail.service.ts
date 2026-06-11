import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendResetCode(email: string, code: string) {
    
    console.log("Sending reset code to:",process.env.EMAIL_USER,);
    console.log("Reset code:", process.env.EMAIL_PASS);

    await this.mailerService.sendMail({

      to: email,
      subject: 'Password Reset Code',
      text: `Your reset code is: ${code}`,
      html: `<b>Your reset code is: ${code}</b>`,
    });
  }
}