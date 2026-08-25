import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import {
  ProductEmailData,
  OrderEmailData,
  productCreatedTemplate,
  welcomeTemplate,
  orderCreatedTemplate,
  orderStatusUpdateTemplate,
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
    order?: OrderEmailData,
    type?: string,
  ) {
    try {
      let subject = 'Test Email';
      let html = welcomeTemplate(name);
      let attachments = [
        {
          filename: 'pdf-test.pdf',
          path: './src/mail/attachments/pdf-test.pdf',
        },
      ];

      if (product && (!type || type === 'product-created')) {
        subject = 'Product added successfully';
        html = productCreatedTemplate(name, product);
        attachments = product.images.map((image) => ({
          filename: image.split('/').pop() || 'image.jpg',
          path: join(process.cwd(), image.replace(/^\//, '')),
        }));
      } else if (order && type === 'order-created') {
        subject = `Order Confirmation #${order.orderId}`;
        html = orderCreatedTemplate(name, order);
        attachments = [];
      } else if (order && type === 'order-status') {
        subject = `Order Update #${order.orderId} - ${order.status}`;
        html = orderStatusUpdateTemplate(name, order);
        attachments = [];
      }

      const mailOptions = {
        from: process.env.MAIL_USER,
        to,
        subject,
        html,
        attachments,
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
