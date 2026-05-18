import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { QueueService } from "../queue/queue.service";
import { EMAIL_JOBS, EMAIL_QUEUE } from "src/common/constants/email.constant";

@Injectable()
export class EmailQueue {
    private readonly emailQueue: Queue;

    constructor(
        private readonly queueService: QueueService
    ){
        this.emailQueue = this.queueService.createQueue(EMAIL_QUEUE);
    }

    // Here we added the jobs into the particular queue
    async sendResetLink(email: string,resetLink: string){
        await this.emailQueue.add(
            EMAIL_JOBS.SEND_RESET_LINK, // Job name
            {email,resetLink}, // Job data
            {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            },
        );
    }
}
