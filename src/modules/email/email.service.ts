import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly transporter: nodemailer.Transporter;

    constructor(
        private readonly configService: ConfigService
    ){
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('NODEMAILER_USER'),
                pass: this.configService.get<string>('NODEMAILER_PASS')
            }
        });
    }

    async sendEmail(to: string,subject: string,body: string){
        await this.transporter.sendMail({
            from: this.configService.get<string>('NODEMAILER_USER'),
            to,
            subject,
            html: body
        });
    }
}
