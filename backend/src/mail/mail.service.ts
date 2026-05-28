import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendResetCode(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Code',
      text: `Your reset code is: ${code}`,
      html: `<b>Your reset code is: ${code}</b>`,
    });
  }
}