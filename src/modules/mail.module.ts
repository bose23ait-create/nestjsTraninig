import { Module } from '@nestjs/common';
import { MailController } from '../controllers/mail.controller';
import { MailService } from '../services/mail.service';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from '../processors/mail.processor';
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [MailController],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
