import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {welcomeTemplate} from '../mail/mail.template'
@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async sendMail(to: string,name:string) {
    try {
      const mailOptions = {
        from: process.env.MAIL_USER,
        to,
        subject: 'Test Email',
        html: welcomeTemplate(name),
        attachments: [{
            filename:'pdf-test.pdf',
            path:'./src/mail/attachments/pdf-test.pdf',
        }]
      };

      await this.transporter.sendMail(mailOptions);

      return {
        message: 'Email sent successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}