
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendMail(to: string, code: string) {
    console.log(`Sending email to ${to}`);
    console.log(`Code: ${code}`);
  }
}