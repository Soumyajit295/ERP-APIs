import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateCategoryDto, UpdateCategoryDto } from "src/common/dto/category.dto";
import { PaginatedResponseDto } from "src/common/dto/paginationResponse.dto";
import { DatabaseService } from "src/database/database.service";

export interface CategoryListItem {
    categoryId: string;
    categoryName: string;
    description?: string;
    isActive: boolean;
    productCount: number;
    createdAt: Date;
}

@Injectable()
export class CategoryRepository {
    constructor(
        private readonly databaseService: DatabaseService
    ){}

    async createCategory(createCategoryDto: CreateCategoryDto,tenantId: string){
        try {
            const createCategoryQuery = `
                INSERT INTO categories(category_name,description,tenant_id)
                VALUES($1,$2,$3)
                RETURNING *
            `;

            const values = [createCategoryDto.name,createCategoryDto.description,tenantId]

            const result = await this.databaseService.query(createCategoryQuery,values)

            if(result.rows.length === 0) return null;

            return {message: 'Category created successfully'}
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while creating category')
        }
    }

    async getPaginatedCategories(
        tenantId: string,
        page = 1,
        limit = 10,
        search?: string
    ):Promise<PaginatedResponseDto<CategoryListItem>>{
        try {
            const currentPage = Math.max(Number(page) || 1, 1);
            const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
            const offset = (currentPage - 1) * pageLimit;
            const searchTerm = search?.trim() || null;

            const countQuery = `
                SELECT COUNT(*)::int AS total
                FROM categories c
                WHERE c.tenant_id = $1
                    AND c.deleted_at IS NULL
                    AND (
                        $2::text IS NULL
                        OR c.category_name ILIKE '%' || $2 || '%'
                    )
            `;

            const categoryQuery = `
                SELECT
                    c.category_id,
                    c.category_name,
                    c.description,
                    c.is_active,
                    COUNT(p.product_id) AS product_count,
                    c.created_at
                FROM categories c
                LEFT JOIN products p
                    ON p.category_id = c.category_id
                    AND p.deleted_at IS NULL
                WHERE c.tenant_id = $1
                    AND c.deleted_at IS NULL
                    AND (
                        $4::text IS NULL
                        OR c.category_name ILIKE '%' || $4 || '%'
                    )
                GROUP BY
                    c.category_id,
                    c.category_name,
                    c.description,
                    c.is_active,
                    c.created_at
                ORDER BY c.created_at DESC
                LIMIT $2
                OFFSET $3
            `;

            const [countResult, categoryResult] = await Promise.all([
                this.databaseService.query(countQuery,[tenantId,searchTerm]),
                this.databaseService.query(categoryQuery,[tenantId,pageLimit,offset,searchTerm]),
            ]);

            const total = countResult.rows[0]?.total ?? 0;
            const totalPages = Math.ceil(total / pageLimit);

            return {
                records: categoryResult.rows.map((row) => this.mapRowToCategoryListItem(row)),
                meta: {
                    page: currentPage,
                    limit: pageLimit,
                    total,
                    totalPages,
                },
            };
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while fetching categories')
        }
    }

    async getCategoryById(categoryId: string){
        try {
            const categoryQuery = `
                SELECT
                    c.category_id,
                    c.category_name,
                    c.description,
                    c.is_active,
                    c.created_at
                FROM categories c
                WHERE c.category_id = $1 AND c.deleted_at IS NULL
            `;

            const result = await this.databaseService.query(categoryQuery,[categoryId])

            if(result.rows.length === 0) return null;

            return this.mapRowToCategoryListItem(result.rows[0])

        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while fetching category by id')
        }
    }

    async updateCategory(updateCategoryDto: UpdateCategoryDto,categoryId: string){
        const updates: string[] = []
        const values: any[] = []
        let index = 1;

        const columnMap = {
            name: 'category_name',
            description: 'description'
        }
        
        Object.entries(updateCategoryDto).forEach(([key,value]) => {
            if(value!==undefined){
                updates.push(`${columnMap[key]} = $${index}`)
                values.push(value)
                index++
            }
        })

        if(updates.length === 0){
            throw new BadRequestException('No fields provided for update')
        }

        values.push(categoryId)
        try {
            const updateQuery = `
                UPDATE categories
                SET ${updates.join(', ')}
                WHERE category_id = $${index}
                RETURNING category_id
            `;

            await this.databaseService.query(updateQuery,values)

            return {message: 'Category updated successfully'}
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error
            }
            throw new InternalServerErrorException('Internal server error, while updating category')
        }
    }

    async deleteCategory(categoryId: string){
        try {
            const deleteQuery = `
                UPDATE categories c
                SET deleted_at = NOW()
                WHERE c.category_id = $1 AND c.deleted_at IS NULL
            `;

            await this.databaseService.query(deleteQuery,[categoryId])
            return {message: 'Category deleted successfully'}
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while deleting the category')
        }
    }

    private mapRowToCategoryListItem(row: any): CategoryListItem {
        return {
            categoryId: row.category_id,
            categoryName: row.category_name,
            description: row.description,
            isActive: row.is_active,
            productCount:  Number(row.product_count) || 0,
            createdAt: row.created_at,
        };
    }
}
