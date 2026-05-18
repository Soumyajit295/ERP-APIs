import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConnectionOptions, Processor, Queue, Worker } from "bullmq";

@Injectable()
export class QueueService implements OnModuleDestroy {
    private readonly connection: ConnectionOptions;
    private readonly queues: Queue[] = [];
    private readonly workers: Worker[] = [];

    constructor(
        private readonly configService: ConfigService
    ){
        this.connection = {
            host: this.configService.get<string>('REDIS_HOST') ?? 'localhost',
            port: this.configService.get<number>('REDIS_PORT') ?? 6379
        }
    }

    createQueue(queueName: string): Queue{
        const queue = new Queue(queueName,{connection: this.connection})
        this.queues.push(queue)
        return queue
    }

    createWorker(queueName: string,processor: Processor): Worker{
        const worker = new Worker(queueName, processor, {
            connection: this.connection,
        });
        this.workers.push(worker)
        return worker
    }

    async onModuleDestroy() {
        await Promise.all([
            ...this.workers.map((worker) => worker.close()),
            ...this.queues.map((queue) => queue.close())
        ])
    }
}