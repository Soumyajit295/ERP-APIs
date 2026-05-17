import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { calculateExpiry } from "src/common/utils/calculateExpiry.util";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class RefreshTokensRepository {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService
    ){}
    async create(refreshToken: string,userId: string){
        const refreshTtl = this.configService.get<string>('REFRESH_TOKEN_TTL')!
        const expiry = calculateExpiry(refreshTtl)

        const refreshTokenQuery = `
            INSERT INTO users_refresh_tokens(refresh_token, expiry, user_id)
            VALUES($1, $2, $3)
            RETURNING *
        `;

        const values = [refreshToken,expiry,userId]
        const result = await this.databaseService.query(refreshTokenQuery,values)
        return result.rows[0].refresh_token
    }
}