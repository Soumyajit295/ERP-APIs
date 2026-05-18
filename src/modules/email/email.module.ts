import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailQueue } from './email.queue';
import { EmailWorker } from './email.worker';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [EmailService,EmailQueue,EmailWorker],
  exports: [EmailQueue]
})
export class EmailModule {}
