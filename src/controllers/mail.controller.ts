import { Controller, Post, Query } from '@nestjs/common';
import { MailService } from '../services/mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendMail(@Query('to') to: string, @Query('name') name: string) {
    return await this.mailService.sendMail(to, name);
  }
}