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

    async query(text: string,params?: any[]): Promise<QueryResult> {
        const start = Date.now()
        try {
            const result = await this.pool.query(text,params)
            const duration = Date.now() - start
            this.logger.log(`Executed query in ${duration}ms : ${text}`)
            return result
        } catch (error) {
            this.logger.error(`Query failed : ${text}`,error)
            throw error
        }
    }

    async getClient(): Promise<PoolClient>{
        return this.pool.connect()
    }

    async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.getClient();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
        throw error;
        } finally {
            client.release();
        }
    }

}
