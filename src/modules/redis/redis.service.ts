import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    constructor(
        @Inject('REDIS_CLIENT')
        private readonly redisClient: Redis
    ){}
    async setData(key: string,data: unknown,ttl?: number){
        try {
            const serializeDate = JSON.stringify(data)
            if(ttl){
                await this.redisClient.set(
                    key,
                    serializeDate,
                    'EX',
                    ttl
                )
            }
            else{
                await this.redisClient.set(key,serializeDate)
            }
        } catch (error) {
            throw new InternalServerErrorException(error,'Internal server error')
        }
    }

    async getData<T>(key: string): Promise<T | null> {
        const data = await this.redisClient.get(key)
        return data ? JSON.parse(data) : null
    }

    async delData(key: string){
        return await this.redisClient.del(key)
    }

    async existData(key: string){
        const exists = await this.redisClient.exists(key)
        return Boolean(exists)
    }
}
