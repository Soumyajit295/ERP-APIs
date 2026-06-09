import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { GetInventoryProductsQueryDto, InventoryDashboardResponseDto, InventoryProduct, InventoryProductsResponseDto } from "src/common/dto/inventory.dto";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class InventoryRepository {
    constructor(
        private readonly databaseService: DatabaseService
    ){}

    async getInventoryDashboardData(tenantId: string): Promise<InventoryDashboardResponseDto>{
        try {
            const dashboardQuery = `
                SELECT
                    (
                        SELECT
                            COALESCE(SUM(i.quantity), 0)::INT
                        FROM inventory i
                        WHERE i.tenant_id = $1
                    )  AS total_units,
                    (
                        SELECT
                            COALESCE(SUM(i.quantity * p.purchase_price),0)::INT
                        FROM inventory i
                        JOIN products p ON p.product_id = i.product_id
                            AND p.deleted_at IS NULL
                        WHERE i.tenant_id = $1
                    )::NUMERIC AS total_cost,
                    (
                        SELECT
                            COUNT(*)::INT
                        FROM warehouses w
                        WHERE w.tenant_id = $1
                            AND w.is_active = TRUE
                            AND w.deleted_at IS NULL
                    ) AS total_warehouse,
                    (
                        SELECT
                            COUNT(*)::INT
                        FROM inventory i
                        JOIN products p ON p.product_id = i.product_id
                            AND p.deleted_at IS NULL
                        WHERE i.tenant_id = $1
                            AND i.quantity <= p.reorder_level
                    )::INT AS low_stock
            
            `;

            const dashboardResult = await this.databaseService.query(dashboardQuery,[tenantId])

            if(dashboardResult.rows.length === 0){
                return {
                    totalUnits: 0,
                    totalCost: 0,
                    totalWarehouse: 0,
                    lowStockCount: 0
                }
            }

            return {
                totalUnits: Number(dashboardResult.rows[0].total_units),
                totalCost: Number(dashboardResult.rows[0].total_cost),
                totalWarehouse: Number(dashboardResult.rows[0].total_warehouse),
                lowStockCount: Number(dashboardResult.rows[0].low_stock)
            }

        } catch (error) {
            throw new InternalServerErrorException('Internal server error while fetching inventory dashboard data')
        }
    }

    async getTenantProducts(getInventoryProductQueryDto: GetInventoryProductsQueryDto,tenantId: string): Promise<InventoryProductsResponseDto>{
        const {
            page = 1,
            limit = 10,
            search,
            warehouseId,
            categoryId
        } = getInventoryProductQueryDto

        const currentPage = Math.max(Number(page),1)
        const pageLimit = Math.min(Math.max(Number(limit),1),100)
        const offset = (currentPage - 1) * pageLimit
        const searchParams = search?.trim() ?? null
        const warehouseIdParams = warehouseId ?? null
        const categoryIdParams = categoryId ?? null

        try {
            const countQuery = `
                SELECT COUNT(*)::INT AS total
                FROM inventory i
                JOIN products p on p.product_id = i.product_id AND p.deleted_at IS NULL
                WHERE i.tenant_id = $1
                    AND (
                        $2::text IS NULL
                        OR p.product_name ILIKE '%' || $2 || '%'
                        OR p.sku ILIKE '%' || $2 || '%'
                    )
                    AND (
                        $3::uuid IS NULL
                        OR i.warehouse_id = $3::uuid
                    )
                    AND (
                        $4::uuid IS NULL
                        OR p.category_id = $4::uuid
                    )
            `;

            const countValues = [tenantId,searchParams,warehouseIdParams,categoryIdParams]

            const countResult = await this.databaseService.query(countQuery,countValues)

            const total = countResult?.rows?.[0]?.total ?? 0
            const totalPages = Math.ceil(total / pageLimit)

            const productsQuery = `
                SELECT
                    p.product_name,
                    p.sku,
                    w.warehouse_name,
                    c.category_name,
                    i.quantity,
                    p.reorder_level,
                    i.updated_at
                FROM inventory i
                JOIN products p
                    ON p.product_id = i.product_id
                    AND p.deleted_at IS NULL
                JOIN warehouses w
                    ON w.warehouse_id = i.warehouse_id
                    AND w.deleted_at IS NULL
                JOIN categories c
                    ON c.category_id = p.category_id
                    AND c.deleted_at IS NULL
                WHERE i.tenant_id = $1
                    AND (
                        $4::text IS NULL
                        OR p.product_name ILIKE '%' || $4 || '%'
                        OR p.sku ILIKE '%' || $4 || '%'
                    )
                    AND (
                        $5::uuid IS NULL
                        OR i.warehouse_id = $5::uuid
                    )
                    AND (
                        $6::uuid IS NULL
                        OR p.category_id = $6::uuid
                    )
                ORDER BY i.updated_at DESC
                LIMIT $2
                OFFSET $3
            `;

            const productResult = await this.databaseService.query(productsQuery,[tenantId,pageLimit,offset,searchParams,warehouseIdParams,categoryIdParams])

            return {
                records: productResult?.rows?.map((row: any) => this.mapRowToInventoryProduct(row)) ?? [],
                meta : {
                    page: currentPage,
                    limit: pageLimit,
                    total,
                    totalPages,
                }
            }

        } catch (error) {
            throw new InternalServerErrorException('Internal server error while fetching inventory products')
        }
    }

    private mapRowToInventoryProduct(row: any): InventoryProduct{
        return {
            productName: row.product_name,
            categoryName: row.category_name,
            productSKU: row.sku,
            warehouseName: row.warehouse_name,
            totalQuantity: Number(row.quantity),
            reorderLevel: Number(row.reorder_level),
            updatedAt: row.updated_at
        }
    }
}
