import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { User } from "src/entities/user.entity";
import { RegisterDto } from "src/modules/auth/dto/register.dto";
import { TenantRepository } from "./tenant.repository";
import { CreateUserDto } from "src/common/dto/createUser.dto";
import * as bcrypt from 'bcrypt';
import { PoolClient } from "pg";
import { Me } from "src/entities/me.entity";

@Injectable()
export class UsersRepository{
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly tenantRepository: TenantRepository
    ){}

    async register(registerDto: RegisterDto){
        return this.databaseService.transaction(async (client) => {
            // Check existing tenant
            const existingTenant = await this.tenantRepository.findByName(registerDto.companyName, client)
            if(existingTenant){
                throw new BadRequestException('Company name already present')
            }
    
            // Check existing email
            const existingEmail = await this.findByEmail(registerDto.email, client)
            if(existingEmail){
                throw new BadRequestException('Email id already registered')
            }
    
            const tenant = await this.tenantRepository.createTenant({companyName: registerDto.companyName,city: registerDto.city}, client)
            const adminResult = await client.query(`SELECT id FROM roles WHERE name = $1 AND tenant_id = $2`,['ADMIN',tenant.id])
            const user = await this.createUser(
                {
                    fname: registerDto.firstName,
                    lname: registerDto.lastName,
                    email: registerDto.email,
                    password: registerDto.password,
                    roleId: adminResult.rows[0].id,
                },
                tenant.id,
                client
            )
            return user;
        })
    }

    async createUser(createUserDto: CreateUserDto,tenantId: string, client?: PoolClient){
        try {
            const query = `
                INSERT INTO users(fname,lname,email,password_hash,role_id,tenant_id,phone)
                VALUES($1,$2,$3,$4,$5,$6,$7)
                RETURNING *
            `
            createUserDto.password = await bcrypt.hash(createUserDto.password,10)
    
            const values = [
                createUserDto.fname,
                createUserDto.lname,
                createUserDto.email,
                createUserDto.password,
                createUserDto.roleId,
                tenantId,
                createUserDto.phone
            ]
    
            const result = client
                ? await client.query(query,values)
                : await this.databaseService.query(query,values)
            return this.mapRowToUser(result.rows[0])
        } catch (error) {
            throw new InternalServerErrorException(error,'Failed to create user')
        }

    }

    async findByEmail(email: string, client?: PoolClient): Promise<User | null>{
        const query = `
            SELECT u.*, r.name AS role_name
            FROM users u
            JOIN roles r
                ON r.id = u.role_id
            WHERE u.email = $1 AND u.deleted_at IS NULL;
        `
        const result = client
            ? await client.query(query,[email])
            : await this.databaseService.query(query,[email])
        if(result.rows.length === 0) return null

        return this.mapRowToUser(result.rows[0])
    }

    async findById(userId: string){
        const query = `
            SELECT u.*, r.name AS role_name
            FROM users u
            JOIN roles r
                ON r.id = u.role_id
            WHERE u.id = $1
        `;
        const result = await this.databaseService.query(query,[userId])
        return this.mapRowToUser(result.rows[0])
    }

    async getPasswordById(userId: string) {
        const query = `
         SELECT password_hash FROM USERS WHERE id = $1 AND deleted_at IS NULL;
        `
        const result = await this.databaseService.query(query,[userId])
        if(result.rows.length === 0) return null

        return result.rows[0].password_hash
    }

    async updatePassword(email: string,password: string) {
        try {
            const query = `
                UPDATE users
                SET password_hash = $2
                WHERE email = $1
            `
            await this.databaseService.query(query,[email,password])
        } catch (error) {
            throw new InternalServerErrorException(error,'Internal server error, Failed to update password')
        }
    }

    async getUser(userId: string): Promise<Me | null> {
        try {
            const query = `
                SELECT
                    u.id AS user_id,
                    u.fname,
                    u.lname,
                    u.email,
                    u.phone,
                    t.id AS tenant_id,
                    t.company_name,
                    r.name AS role_name
                FROM users u
                JOIN tenants t 
                    ON t.id = u.tenant_id
                JOIN roles r 
                    ON r.id = u.role_id
                WHERE u.id = $1;
            `;

            const result = await this.databaseService.query(query, [userId]);

            if (result.rows.length === 0) {
                return null;
            }

            return this.mapRowToMeResponse(result.rows[0]);

        } catch (error: any) {
            throw new InternalServerErrorException(
                'Internal server error, Failed to fetch user'
            );
        }
    }

    private mapRowToMeResponse(row: any): Me {
        return {
            userId: row.user_id,
            fname: row.fname,
            lname: row.lname,
            email: row.email,
            phone: row.phone,
            tenantId: row.tenant_id,
            companyName: row.company_name,
            roleName: row.role_name,
        };
    }

    private mapRowToUser(row: any): User{
        return{
            id: row.id,
            fname: row.fname,
            lname: row.lname,
            email: row.email,
            roleId: row.role_id,
            roleName: row.role_name,
            tenantId: row.tenant_id,
            phone: row.phone,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
            deleted_at: row.deleted_at
        }
    }
}
