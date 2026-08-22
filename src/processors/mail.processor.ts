import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { MailService } from '../services/mail.service';
import type { ProductEmailData } from '../mail/mail.template';

interface MailJobData {
  to: string;
  name: string;
  product?: ProductEmailData;
}

@Processor('email')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job) {
    try {
      console.log('Email job received:', job.name);
      console.log('Job data:', job.data);

      if (job.name === 'send-email') {
        const { to, name, product } = job.data as unknown as MailJobData;

        await this.mailService.sendMail(to, name, product);

        console.log(`Email sent successfully to ${to}`);
      }
    } catch (error) {
      console.error('Email job failed:', error);
      throw error;
    }
  }
}
