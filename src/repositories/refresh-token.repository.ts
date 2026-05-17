import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { calculateExpiry } from "src/common/utils/calculateExpiry.util";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class RefreshTokensRepository {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
    ){}
    async create(refreshToken: string,userId: string,client?: any){
        const refreshTtl = this.configService.get<string>('REFRESH_TOKEN_TTL')!
        const expiry = calculateExpiry(refreshTtl)

        const refreshTokenQuery = `
            INSERT INTO users_refresh_tokens(refresh_token, expiry, user_id)
            VALUES($1, $2, $3)
            RETURNING *
        `;

        const values = [refreshToken,expiry,userId]
        const db = client ?? this.databaseService
        const result = await db.query(refreshTokenQuery,values)
        return result.rows[0].refresh_token
    }

    async update(tokenId: string,newlyCreatedRefreshToken: string,userId: string){
        try{
            await this.databaseService.transaction(async (client) => {
                await client.query(
                    `
                        UPDATE users_refresh_tokens
                        SET revoked = true
                        WHERE id = $1
                    `,
                    [tokenId]
                );
                await this.create(newlyCreatedRefreshToken,userId,client)
            })
            
        }catch(error: any){
            throw new InternalServerErrorException('Unable to create token, Please retry')
        }

    }

    async revokeAllToken(userId: string){
        const query = `
            UPDATE users_refresh_tokens
            SET revoked = true
            WHERE user_id = $1
        `;
        try{
            await this.databaseService.query(query,[userId])
        } catch(error: any){
            throw new InternalServerErrorException('Uanble revoke token, please login again')
        }
    }

    async serachByRefreshToken(refreshToken: string){
        const query = `
            SELECT * FROM users_refresh_tokens
            WHERE refresh_token = $1
        `;
        const result = await this.databaseService.query(query,[refreshToken])
        if(result.rows.length === 0) return null
        return this.mapRowToRefreshToken(result.rows[0])
    }

    private mapRowToRefreshToken(row: any){
        return {
            id: row.id,
            refreshToken: row.refresh_token,
            revoked: row.revoked,
            expiry: row.expiry,
            userId: row.user_id
        }
    }
}
