import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { User } from "src/entities/user.entity";
import { RegisterDto } from "src/modules/auth/dto/register.dto";
import { TenantRepository } from "./tenant.repository";
import { CreateUserDto } from "src/common/dto/createUser.dto";
import * as bcrypt from 'bcrypt';
import { PoolClient } from "pg";
import { Me } from "src/entities/me.entity";
import { PermissionRepository } from "./permission.repository";
import { UpdateUserDto } from "src/common/dto/updateUser.dto";
import { GetUsersQueryDto, UserListResponseDto, UserResponse } from "src/common/dto/user.dto";

@Injectable()
export class UsersRepository{
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly tenantRepository: TenantRepository,
        private readonly permissionRepository: PermissionRepository
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
            if(adminResult.rows.length === 0){
                throw new InternalServerErrorException('Admin role not created for tenant')
            }
            const user = await this.createUser(
                {
                    fname: registerDto.firstName,
                    lname: registerDto.lastName,
                    email: registerDto.email,
                    password: registerDto.password,
                    roleId: adminResult.rows[0].id,
                },
                tenant.id,
                'SYSTEM',
                client
            )
            await this.permissionRepository.giveAllModulePermissionToAdminForTenant(adminResult.rows[0].id,tenant.id,client)
            return user;
        })
    }

    async createUser(createUserDto: CreateUserDto, tenantId: string, createdBy: string, client?: PoolClient){
        try {
            const query = `
                INSERT INTO users(fname,lname,email,password_hash,role_id,tenant_id,phone,created_by)
                VALUES($1,$2,$3,$4,$5,$6,$7,$8)
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
                createUserDto.phone,
                createdBy
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

    async updateUser(updateUserDto: UpdateUserDto,userId: string) {
        try {
            const updates: string[] = []
            const values: any[] = []
            let index = 1

            const columnMap = {
                fname: 'fname',
                lname: 'lname',
                phone: 'phone',
                roleId: 'role_id',
            };

            Object.entries(updateUserDto).forEach(([key,value]) => {
                if(value!==undefined){
                    updates.push(`${columnMap[key]} = $${index}`)
                    values.push(value)
                    index++
                }
            })

            if (updates.length === 0) {
                throw new Error('No fields provided for update');
            }

            values.push(userId)

            const updateQuery = `
                UPDATE users 
                SET ${updates.join(', ')}
                WHERE id = $${index}
                RETURNING *
            `

            const result = await this.databaseService.query(updateQuery,values)

            if(result.rows.length === 0) return null;

            return this.mapRowToUser(result.rows[0])
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while updating user')
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

    async deleteUser(userId: string){
        try {
            const user = await this.findById(userId)

            if(!user){
                throw new BadRequestException('User not found')
            }

            if(user.createdBy === 'SYSTEM'){
                throw new BadRequestException('System created user cannot be deleted')
            }

            const deleteQuery = `
                UPDATE users
                SET deleted_at = NOW()
                WHERE id = $1 AND deleted_at IS NULL
                RETURNING id
            `;

            await this.databaseService.query(deleteQuery,[userId])

            return {message : 'User deleted successfully'}
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error
            }
            throw new InternalServerErrorException('Internal server error, while deleting user')
        }
    }

    async getTenantUsers(
        getUsersQueryDto: GetUsersQueryDto,
        tenantId: string,
    ): Promise<UserListResponseDto> {
        try {
            const { page = 1, limit = 10, search, roleId } = getUsersQueryDto;

            const currentPage = Math.max(Number(page), 1);
            const pageLimit = Math.min(Math.max(Number(limit), 1), 100);
            const offset = (currentPage - 1) * pageLimit;
            const searchParam = search?.trim() ?? null;
            const roleIdParam = roleId?.trim() ?? null;

            const countQuery = `
                SELECT COUNT(*)::INT AS total
                FROM users u
                JOIN roles r on r.id = u.role_id
                WHERE u.tenant_id = $1
                    AND u.deleted_at IS NULL
                    AND ($2::uuid IS NULL OR u.role_id = $2)
                    AND ($3::text IS NULL OR u.fname ILIKE '%' || $3 || '%' OR u.lname ILIKE '%' || $3 || '%' OR u.email ILIKE '%' || $3 || '%')
            `;

            const userQuery = `
                SELECT 
                    u.id AS user_id,
                    u.fname,
                    u.lname,
                    u.email,
                    u.phone,
                    u.tenant_id,
                    u.role_id,
                    r.name as role_name,
                    u.created_by
                FROM users u
                JOIN roles r on r.id = u.role_id
                WHERE u.tenant_id = $1
                    AND u.deleted_at IS NULL
                    AND ($2::uuid IS NULL OR u.role_id = $2)
                    AND ($3::text IS NULL OR u.fname ILIKE '%' || $3 || '%' OR u.lname ILIKE '%' || $3 || '%' OR u.email ILIKE '%' || $3 || '%')
                ORDER BY u.created_at DESC
                LIMIT $4
                OFFSET $5
            `;

            const [countResult, userResult] = await Promise.all([
                this.databaseService.query(countQuery, [tenantId, roleIdParam, searchParam]),
                this.databaseService.query(userQuery, [tenantId, roleIdParam, searchParam, pageLimit, offset]),
            ]);

            const total = countResult?.rows[0]?.total ?? 0;
            const totalPages = Math.ceil(total / pageLimit) ?? 0;

            return {
                records: userResult?.rows?.map((row: any) => this.mapRowToUserResponse(row)),
                meta: { page: currentPage, limit: pageLimit, total, totalPages },
            };
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, failed to fetch tenant users')
        }
    }

    private mapRowToUserResponse(row: any): UserResponse {
        return {
            userId: row.user_id,
            fname: row.fname,
            lname: row.lname,
            email: row.email,
            phone: row.phone,
            tenantId: row.tenant_id,
            roleId: row.role_id,
            roleName: row.role_name,
            createdBy: row.created_by
        };
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
            roleId: row.role_id,
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
            createdBy: row.created_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
            deleted_at: row.deleted_at
        }
    }
}
