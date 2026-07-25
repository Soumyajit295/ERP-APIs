import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class ModuleRepository {
    constructor(
        private readonly databaseService: DatabaseService
    ){}

    async getTenantModules(){
        try {
            const query = `
                SELECT 
                    m.module_name AS label,
                    m.module_id AS value
                FROM modules m
                WHERE m.deleted_at IS NULL
            `;

            const result = await this.databaseService.query(query,[])

            return result?.rows
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while fetching modules')
        }
    }
}