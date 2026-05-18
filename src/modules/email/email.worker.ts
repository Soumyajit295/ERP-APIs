import { Injectable, OnModuleInit } from "@nestjs/common";
import { QueueService } from "../queue/queue.service";
import { EMAIL_JOBS, EMAIL_QUEUE } from "src/common/constants/email.constant";
import { readFileSync } from 'fs';
import { join } from 'path';
import * as handlebars from 'handlebars';
import { EmailService } from "./email.service";

@Injectable()
export class EmailWorker implements OnModuleInit{
    constructor(
        private readonly queueService: QueueService,
        private readonly emailService: EmailService
    ){}

    async onModuleInit() {
        this.queueService.createWorker(EMAIL_QUEUE,async (job) => {
            if(job.name === EMAIL_JOBS.SEND_RESET_LINK){
                const {email,resetLink} = job.data;
                const html = this.loadTemplate('reset-password',{ resetLink });
                await this.emailService.sendEmail(email,'Reset Link',html);
            }
        });
    }

    private loadTemplate(templateName: string, data: any) {
        const file = readFileSync(
            join(__dirname, 'templates', `${templateName}.hbs`),
            'utf-8',
        );

        const compiled = handlebars.compile(file);
        return compiled(data);
    }
}
