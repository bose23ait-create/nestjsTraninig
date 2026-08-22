import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import {
  ProductEmailData,
  productCreatedTemplate,
  welcomeTemplate,
} from '../mail/mail.template';
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

  async sendMail(
    to: string,
    name: string,
    product?: ProductEmailData,
  ) {
    try {
      const mailOptions = {
        from: process.env.MAIL_USER,
        to,
        subject: product ? 'Product added successfully' : 'Test Email',
        html: product ? productCreatedTemplate(name, product) : welcomeTemplate(name),
        attachments: product
          ? product.images.map((image) => ({
              filename: image.split('/').pop(),
              path: join(process.cwd(), image.replace(/^\//, '')),
            }))
          : [{
              filename: 'pdf-test.pdf',
              path: './src/mail/attachments/pdf-test.pdf',
            }],
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