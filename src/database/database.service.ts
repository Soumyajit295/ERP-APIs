import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool, PoolClient, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name)
    private pool: Pool

    constructor(private readonly configService: ConfigService){}

    async onModuleInit(){
        const host = this.configService.get<string>('DATABASE_HOST','localhost')
        const port = this.configService.get<number>('DATABASE_PORT',5432)
        const user = this.configService.get<string>('DATABASE_USER','postgres')
        const database = this.configService.get<string>('DATABASE_NAME','erp_database')
        const password = this.configService.get<string>('DATABASE_PASSWORD')

        this.pool = new Pool({
            host,
            port,
            user,
            database,
            password,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000
        })

        try {
            const client = await this.pool.connect()
            this.logger.log('Database connected successfully')
            client.release()
        } catch (error: any) {
            this.logger.error('Failed to connect with database',error)
        }
    }

    async onModuleDestroy() {
        if(this.pool){
            await this.pool.end()
            this.logger.log('Database connection pool failed')
        }
    }
}
