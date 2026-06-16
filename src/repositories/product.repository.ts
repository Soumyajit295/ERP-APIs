import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateProductDto, GetProductQueryDto, ProductOptionDto, UpdateProductDto } from "src/common/dto/product.dto";
import { PaginatedResponseDto } from "src/common/dto/paginationResponse.dto";
import { DatabaseService } from "src/database/database.service";

export interface ProductItem{
    productId: string;
    productName: string;
    sku: string;
    barcode?: string;
    status: string;
    purchasePrice: number;
    sellingPrice: number;
    reorderLevel: number;
    categoryName: string;
    description?: string
}
@Injectable()
export class ProductRepository {
    constructor(
        private readonly databaseService: DatabaseService
    ){}

    async createProduct(createProductDto: CreateProductDto,tenantId: string){
        try {
            const {categoryId,name,sku,barcode,purchasePrice,sellingPrice,reorderLevel,status,description} = createProductDto

            const createQuery = `
                INSERT INTO products(
                    tenant_id,
                    category_id,
                    product_name,
                    sku,
                    barcode,
                    purchase_price,
                    selling_price,
                    reorder_level,
                    description,
                    status
                )
                VALUES($1,$2,$3,$4,$5,$6,$7,COALESCE($8, 10),$9,$10)
                RETURNING product_id
            `
            const values=[
                tenantId,
                categoryId,
                name,
                sku,
                barcode,
                purchasePrice,
                sellingPrice,
                reorderLevel,
                description,
                status
            ]

            const result = await this.databaseService.query(createQuery,values)

            if(result.rows.length === 0) return null

            return {message: "Product created successfully"}
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while creating product')
        }
    }

    async getPaginatedProducts(
        tenantId: string,
        getProductQueryDto: GetProductQueryDto
    ): Promise<PaginatedResponseDto<ProductItem>> {
        const {page = 1,limit = 10,categoryId,status,search} = getProductQueryDto

        const currentPage = Math.max(Number(page) || 1,1)
        const pageLimit = Math.min(Math.max(Number(limit) || 10,1),100)
        const offset = (currentPage - 1) * pageLimit
        const categoryIdParams = categoryId?.trim() || null;
        const statusParams = status || null;
        const searchParams = search?.trim() || null;

        try {
            const countQuery = `
                SELECT COUNT(*)::int AS total
                FROM products p
                WHERE p.tenant_id = $1
                    AND p.deleted_at IS NULL
                    AND (
                        $2::uuid IS NULL
                        OR p.category_id = $2::uuid
                    )
                    AND (
                        $3::product_status_enum IS NULL
                        OR p.status = $3::product_status_enum
                    )
                    AND (
                        $4::text IS NULL
                        OR p.product_name ILIKE '%' || $4 || '%'
                        OR p.sku ILIKE '%' || $4 || '%'
                        OR p.barcode ILIKE '%' || $4 || '%'
                    )
            `;

            const productQuery = `
                SELECT
                    p.product_id,
                    p.product_name,
                    p.sku,
                    p.barcode,
                    p.purchase_price,
                    p.selling_price,
                    p.reorder_level,
                    p.status,
                    c.category_name
                FROM products p
                JOIN categories c 
                    ON c.category_id = p.category_id
                    AND c.deleted_at IS NULL
                WHERE p.tenant_id = $1
                    AND p.deleted_at IS NULL
                    AND (
                        $4::uuid IS NULL
                        OR p.category_id = $4::uuid
                    )
                    AND (
                        $5::product_status_enum IS NULL
                        OR p.status = $5::product_status_enum
                    )
                    AND (
                        $6::text IS NULL
                        OR p.product_name ILIKE '%' || $6 || '%'
                        OR p.sku ILIKE '%' || $6 || '%'
                        OR p.barcode ILIKE '%' || $6 || '%'
                    )
                ORDER BY p.created_at DESC
                LIMIT $2
                OFFSET $3
            `

            const productValues = [
                tenantId,
                pageLimit,
                offset,
                categoryIdParams,
                statusParams,
                searchParams
            ]

            const countValues = [
                tenantId,
                categoryIdParams,
                statusParams,
                searchParams
            ]

            const [countResult,productResult] = await Promise.all([
                this.databaseService.query(countQuery,countValues),
                this.databaseService.query(productQuery,productValues)
            ])

            const total = countResult?.rows?.[0]?.total ?? 0;
            const totalPages = Math.ceil(total / pageLimit)

            return {
                records: productResult?.rows?.map((row: any) =>this.mapRowToProduct(row)) ?? [],
                meta: {
                    page: currentPage,
                    limit: pageLimit,
                    total,
                    totalPages
                }
            }
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while fetching products')
        }
    }

    async getProductById(productId: string,tenantId: string){
        try {
            const productQuery = `
                SELECT
                    p.product_id,
                    p.product_name,
                    p.sku,
                    p.barcode,
                    p.status,
                    p.purchase_price,
                    p.selling_price,
                    p.reorder_level,
                    c.category_name,
                    p.description
                FROM products p
                JOIN categories c
                    ON c.category_id = p.category_id
                    AND c.deleted_at IS NULL
                WHERE p.product_id = $1
                AND p.tenant_id = $2
                AND p.deleted_at IS NULL
            `;

            const result = await this.databaseService.query(productQuery,[productId,tenantId])

            if(result.rows.length === 0) return null;

            return this.mapRowToProduct(result.rows[0])
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while fetching product')
        }
    }

    async updateProduct(updateProductDto: UpdateProductDto,productId: string,tenantId: string){
        const updates: string[] = []
        const values: any[] = []
        let index = 1

        const columnMap = {
            name: 'product_name',
            sku: 'sku',
            barcode: 'barcode',
            categoryId: 'category_id',
            purchasePrice: 'purchase_price',
            sellingPrice: 'selling_price',
            reorderLevel: 'reorder_level',
            status: 'status',
            description: 'description'
        }

        Object.entries(updateProductDto).forEach(([key,value]) => {
            if(value!==undefined){
                updates.push(`${columnMap[key]} = $${index}`)
                values.push(value)
                index++
            }
        })

        if(updates.length === 0){
            throw new BadRequestException('At least one field has to be updated')
        }

        values.push(productId, tenantId)
        try {
            const updateQuery = `
                UPDATE products
                SET ${updates.join(', ')}, updated_at = NOW()
                WHERE product_id = $${index}
                AND tenant_id = $${index + 1}
                AND deleted_at IS NULL
                RETURNING product_id
            `;

            await this.databaseService.query(updateQuery,values)

            return {message: 'Product updated successfully'}
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error
            }
            throw new InternalServerErrorException('Internal server error, while updating product')
        }
    }

    async deleteProduct(productId: string,tenantId: string){
        try {
            const deleteQuery = `
                UPDATE products p
                SET deleted_at = NOW()
                WHERE p.product_id = $1
                AND p.tenant_id = $2
                AND p.deleted_at IS NULL
            `;
            await this.databaseService.query(deleteQuery,[productId,tenantId])

            return {message: 'Product deleted successfully'}

        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while deleting product')
        }
    }

    async getProductsCategory(tenantId: string){
        try {
            const query = `
                SELECT 
                    c.category_id,
                    c.category_name
                FROM categories c
                WHERE c.tenant_id = $1
                AND c.deleted_at IS NULL
            `;
            const result = await this.databaseService.query(query,[tenantId])
            return result.rows.map((row) => this.mapRowToProductCategory(row))
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while fetching products categories')
        }
    }

    async getProductOptions(tenantId: string): Promise<ProductOptionDto[]>{
        try {
            const query = `
                SELECT
                    p.product_name,
                    p.product_id
                FROM products p
                WHERE p.tenant_id = $1
                AND p.deleted_at IS NULL
            `;

            const result = await this.databaseService.query(query,[tenantId])

            const options = result?.rows?.map((row: any) => {
                return {
                    label: row.product_name,
                    value: row.product_id
                }
            })

            return options
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while fetching product options')
        }
    }

    private mapRowToProduct(row: any): ProductItem{
        return {
            productId: row.product_id,
            productName: row.product_name,
            sku: row.sku,
            barcode: row.barcode,
            status: row.status,
            purchasePrice: Number(row.purchase_price),
            sellingPrice: Number(row.selling_price),
            reorderLevel: Number(row.reorder_level),
            categoryName: row.category_name,
            description: row.description
        }
    }

    private mapRowToProductCategory(row: any){
        return {
            label: row.category_name,
            value: row.category_id
        }
    }
}
