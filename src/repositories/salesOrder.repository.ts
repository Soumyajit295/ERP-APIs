import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateSalesOrderDto, GetSalesOrderQueryDto, SalesOrderDashboardResponseDto, SalesOrderItemsDto, SalesOrderItemsResponseDto, SalesOrderListResponseDto, SalesOrderPaginatedResponseDto, UpdateSalesOrderStatusDto } from "src/common/dto/sales-order.dto";
import { DatabaseService } from "src/database/database.service";
import { CustomerRepository } from "./customer.repository";
import { SalesOrderStatus } from "src/common/enums/sales-order.enum";

@Injectable()
export class SalesOrdresRepository {
    constructor(
        private readonly customerRepository: CustomerRepository,
        private readonly databaseService: DatabaseService
    ){}

    async createSalesOrder(createSalesOrderDto: CreateSalesOrderDto,tenantId: string){
        try {
            const customer = await this.customerRepository.getCustomerById(createSalesOrderDto.customerId,tenantId)
            if(!customer){
                throw new BadRequestException('Customer not found')
            }
            return await this.databaseService.transaction(async(client) => {
                const salesOrderNumber = `SO-${new Date().getFullYear()}-${Date.now()}`

                const salesOrderQuery = `
                    INSERT INTO sales_orders(
                        tenant_id,
                        so_number,
                        customer_id,
                        warehouse_id,
                        order_date
                    )
                    VALUES($1,$2,$3,$4,$5)
                    RETURNING *
                `;

                const salesOrderValues = [
                    tenantId,
                    salesOrderNumber,
                    createSalesOrderDto.customerId,
                    createSalesOrderDto.warehouseId,
                    createSalesOrderDto.orderDate
                ]

                const salesOrderResult = await client.query(salesOrderQuery,salesOrderValues)

                if(salesOrderResult?.rows?.length === 0){
                    throw new BadRequestException('Failed to create sales order')
                }

                const {so_id,warehouse_id} = salesOrderResult.rows[0]

                for(let product of createSalesOrderDto.items){
                    const quantityQuery = `
                        SELECT 
                            i.quantity,
                            i.reserved_quantity
                        FROM inventory i
                        WHERE i.tenant_id = $1
                            AND i.warehouse_id = $2
                            AND i.product_id = $3
                    `;

                    const quantityValues = [tenantId,warehouse_id,product.productId]

                    const quantityResult = await client.query(quantityQuery,quantityValues)

                    if(quantityResult?.rows?.length === 0){
                        throw new BadRequestException('Product not found')
                    }

                    const {quantity,reserved_quantity} = quantityResult.rows[0]

                    const availableProducts = quantity - reserved_quantity

                    if(availableProducts < product.quantity){
                        throw new BadRequestException('Insufficient stock, cannot create sales order')
                    }

                    const salesOrderItemsQuery = `
                        INSERT INTO sales_order_items(
                            so_id,
                            tenant_id,
                            product_id,
                            quantity,
                            selling_price,
                            discount,
                            line_total
                        )
                        VALUES($1,$2,$3,$4,$5,$6,$7)
                        RETURNING soi_id
                    `;

                    const salesOrderItemValues = [
                        so_id,
                        tenantId,
                        product.productId,
                        product.quantity,
                        product.sellingPrice,
                        product.discount,
                        (product.sellingPrice - product.discount) * product.quantity
                    ]

                    const salesOrderItemsResult = await client.query(salesOrderItemsQuery,salesOrderItemValues)

                    if(salesOrderItemsResult?.rows?.length === 0){
                        throw new BadRequestException('Unable to create sales order items')
                    }
                }

                return {message: 'Sales order created successfully'}
            })
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error
            }
            throw new InternalServerErrorException('Internal server error, while creating sales order')
        }
    }

    private async getSalesOrder(
        client: any,
        salesOrderId: string,
        tenantId: string,
    ) {
        const query = `
            SELECT
            so.so_id,
            so.so_number,
            so.customer_id,
            so.warehouse_id,
            so.status,
            so.order_date
            FROM sales_orders so
            WHERE so.so_id = $1
            AND so.tenant_id = $2
            AND so.deleted_at IS NULL
        `;

        const database = client ? client : this.databaseService

        const result = await database.query(
            query,
            [salesOrderId, tenantId],
        );

        return result.rows[0] ?? null;
    }

    private async getSalesOrderItems(
        client: any,
        salesOrderId: string,
    ) {
        const query = `
            SELECT
                soi.product_id,
                soi.quantity
            FROM sales_order_items soi
            WHERE soi.so_id = $1
        `;

        const database = client ? client : this.databaseService

        const result = await database.query(
            query,
            [salesOrderId],
        );

        return result.rows;
    }

    private async validateInventoryAvailability(
        client: any,
        tenantId: string,
        warehouseId: string,
        productId: string,
        requiredQuantity: number,
    ) {
        const query = `
            SELECT
            quantity,
            reserved_quantity
            FROM inventory
            WHERE tenant_id = $1
            AND warehouse_id = $2
            AND product_id = $3
        `;

        const result = await client.query(
            query,
            [tenantId, warehouseId, productId],
        );

        if (result.rows.length === 0) {
            throw new BadRequestException(
            'Inventory record not found',
            );
        }

        const {
            quantity,
            reserved_quantity,
        } = result.rows[0];

        const availableQuantity =
            Number(quantity) -
            Number(reserved_quantity);

        if (requiredQuantity > availableQuantity) {
            throw new BadRequestException(
            'Insufficient stock',
            );
        }

        return true;
    }

    private async reserveInventory(
        client: any,
        tenantId: string,
        warehouseId: string,
        productId: string,
        quantity: number,
    ) {
        const query = `
            UPDATE inventory
            SET
            reserved_quantity =
                reserved_quantity + $1,
            updated_at = NOW()
            WHERE tenant_id = $2
            AND warehouse_id = $3
            AND product_id = $4
        `;

        const result = await client.query(
            query,
            [
            quantity,
            tenantId,
            warehouseId,
            productId,
            ],
        );

        if (result.rowCount === 0) {
            throw new BadRequestException(
            'Failed to reserve inventory',
            );
        }
    }

    private async releaseInventory(
        client: any,
        tenantId: string,
        warehouseId: string,
        productId: string,
        quantity: number,
    ) {
        const query = `
            UPDATE inventory
            SET
            reserved_quantity =
                reserved_quantity - $1,
            updated_at = NOW()
            WHERE tenant_id = $2
            AND warehouse_id = $3
            AND product_id = $4
        `;

        const result = await client.query(
            query,
            [
            quantity,
            tenantId,
            warehouseId,
            productId,
            ],
        );

        if (result.rowCount === 0) {
            throw new BadRequestException(
            'Failed to release inventory',
            );
        }
    }

    private async completeInventory(
        client: any,
        tenantId: string,
        warehouseId: string,
        productId: string,
        quantity: number,
    ) {
        const query = `
            UPDATE inventory
            SET
            quantity = quantity - $1,
            reserved_quantity =
                reserved_quantity - $1,
            updated_at = NOW()
            WHERE tenant_id = $2
            AND warehouse_id = $3
            AND product_id = $4
        `;

        const result = await client.query(
            query,
            [
            quantity,
            tenantId,
            warehouseId,
            productId,
            ],
        );

        if (result.rowCount === 0) {
            throw new BadRequestException(
            'Failed to complete inventory update',
            );
        }
    }

    private validateStatusTransition(
        currentStatus: SalesOrderStatus,
        nextStatus: SalesOrderStatus,
    ) {
        const allowedTransitions: Record<
            SalesOrderStatus,
            SalesOrderStatus[]
        > = {
            [SalesOrderStatus.DRAFT]: [
            SalesOrderStatus.CONFIRMED,
            SalesOrderStatus.CANCELLED,
            ],

            [SalesOrderStatus.CONFIRMED]: [
            SalesOrderStatus.COMPLETED,
            SalesOrderStatus.CANCELLED,
            ],

            [SalesOrderStatus.COMPLETED]: [],

            [SalesOrderStatus.CANCELLED]: [],
        };

        const isAllowed =
            allowedTransitions[currentStatus]?.includes(
            nextStatus,
            );

        if (!isAllowed) {
            throw new BadRequestException(
            `Cannot change status from ${currentStatus} to ${nextStatus}`,
            );
        }
    }

    async updateSalesOrderStatus(
        updateSalesOrderDto: UpdateSalesOrderStatusDto,
        salesOrderId: string,
        tenantId: string,
    ) {
        try {
            return await this.databaseService.transaction(
            async (client) => {

                const salesOrder = await this.getSalesOrder(
                    client,
                    salesOrderId,
                    tenantId,
                );

                if (!salesOrder) {
                throw new BadRequestException(
                    'Sales order not found',
                );
                }

                this.validateStatusTransition(
                    salesOrder.status,
                    updateSalesOrderDto.status,
                );

                const products =
                await this.getSalesOrderItems(
                    client,
                    salesOrderId,
                );

                switch (updateSalesOrderDto.status) {

                case SalesOrderStatus.CONFIRMED:

                    for (const product of products) {

                    await this.validateInventoryAvailability(
                        client,
                        tenantId,
                        salesOrder.warehouse_id,
                        product.product_id,
                        product.quantity,
                    );

                    await this.reserveInventory(
                        client,
                        tenantId,
                        salesOrder.warehouse_id,
                        product.product_id,
                        product.quantity,
                    );
                    }

                    break;

                case SalesOrderStatus.COMPLETED:

                    for (const product of products) {

                    await this.completeInventory(
                        client,
                        tenantId,
                        salesOrder.warehouse_id,
                        product.product_id,
                        product.quantity,
                    );
                    }

                    break;

                case SalesOrderStatus.CANCELLED:

                    // release inventory only if order was confirmed

                    if (
                        salesOrder.status === SalesOrderStatus.CONFIRMED
                    ) {
                        for (const product of products) {

                            await this.releaseInventory(
                                client,
                                tenantId,
                                salesOrder.warehouse_id,
                                product.product_id,
                                product.quantity,
                            );
                        }
                    }

                    break;
                }

                const updateQuery = `
                    UPDATE sales_orders
                    SET
                        status = $1,
                        updated_at = NOW()
                    WHERE so_id = $2
                        AND tenant_id = $3
                        AND deleted_at IS NULL
                    RETURNING so_id
                `;

                const updateResult =
                await client.query(
                    updateQuery,
                    [
                        updateSalesOrderDto.status,
                        salesOrderId,
                        tenantId,
                    ],
                );

                if (updateResult.rows.length === 0) {
                    throw new BadRequestException(
                        'Failed to update sales order status',
                    );
                }

                return {
                    message:
                        'Sales order status updated successfully',
                };
            });
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            console.log("Error : ",error)

            throw new InternalServerErrorException('Internal server error while updating sales order status');
        }
    }

    async getSalesOrderById(salesOrderId: string,tenantId: string){
        try {
            const query = `
                SELECT 
                    so.so_id
                FROM sales_orders so
                WHERE so.so_id = $1
                    AND so.tenant_id = $2
                    AND so.deleted_at IS NULL
            `;

            const result = await this.databaseService.query(query,[salesOrderId,tenantId])

            if(result?.rows?.length === 0) return null

            return result?.rows[0]?.so_id
        } catch (error) {
            throw new InternalServerErrorException('Internal server error while fetching sales order')
        }
    }

    async getPaginatedSalesOrders(getSalesOrderDto: GetSalesOrderQueryDto,tenantId: string): Promise<SalesOrderPaginatedResponseDto>{
        const {
            page = 1,
            limit = 10,
            customerId,
            status,
            search
        } = getSalesOrderDto

        const currentPage = Math.max(Number(page),1)
        const pageLimit = Math.min(Math.max(Number(limit),1),100)
        const offset = (currentPage - 1) * pageLimit
        const customerIdQuery = customerId ?? null
        const statusQuery = status ?? null
        const searchQuery = search ?? null

        try {
            const countQuery = `
                SELECT COUNT(*)::INT AS total
                FROM sales_orders so
                WHERE so.tenant_id = $1
                  AND so.deleted_at IS NULL
                  AND(
                    $2::uuid IS NULL 
                    OR so.customer_id = $2
                  )
                  AND(
                    $3::sales_order_status_enum IS NULL
                    OR so.status = $3::sales_order_status_enum
                  )
                  AND(
                    $4::text IS NULL
                    OR so.so_number ILIKE '%' || $4 || '%'
                  )
            
            `;
    
            const countValues = [tenantId,customerIdQuery,statusQuery,searchQuery]
    
            const salesOrderQuery = `
                SELECT 
                    so.so_id,
                    so.so_number,
                    c.customer_name,
                    w.warehouse_name,
                    so.order_date,
                    so.status
                FROM sales_orders so
                JOIN customers c ON c.customer_id = so.customer_id
                JOIN warehouses w ON w.warehouse_id = so.warehouse_id
                WHERE so.tenant_id = $1
                    AND so.deleted_at IS NULL
                    AND(
                        $4::uuid IS NULL 
                        OR so.customer_id = $4
                    )
                    AND(
                        $5::sales_order_status_enum IS NULL
                        OR so.status = $5::sales_order_status_enum
                    )
                    AND(
                        $6::text IS NULL
                        OR so.so_number ILIKE '%' || $6 || '%'
                    )
                ORDER BY so.created_at
                LIMIT $2
                OFFSET $3
            `;
    
            const salesOrderValues = [tenantId,pageLimit,offset,customerIdQuery,statusQuery,searchQuery]
    
            const [countResult,salesOrderResult] = await Promise.all([
                this.databaseService.query(countQuery,countValues),
                this.databaseService.query(salesOrderQuery,salesOrderValues)
            ])
    
            const total = countResult?.rows[0]?.total
            const totalPages = Math.ceil(total / pageLimit)
    
            return {
                records: salesOrderResult?.rows?.map((row: any) => this.mapRowToSalesOrderListResponse(row)),
                meta: {
                    page: currentPage,
                    limit: pageLimit,
                    total,
                    totalPages
                }
            }
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while fetching the sales orders')
        }
    }

    async getSalesOrderDashboard(tenantId: string,salesOrderId: string): Promise<SalesOrderDashboardResponseDto>{
        try {
            const query = `
                SELECT 
                    so.so_id,
                    so.so_number,
                    so.order_date,
                    (
                        SELECT COALESCE(SUM(soi.line_total), 0)::float
                        FROM sales_order_items soi
                        WHERE soi.so_id = so.so_id
                    ) AS sales_order_total_price,
                    so.status,
                    c.customer_name,
                    c.phone,
                    c.email,
                    w.warehouse_name,
                    w.address,
                    w.contact_person,
                    w.phone AS warehouse_phone
                FROM sales_orders so
                JOIN customers c ON c.customer_id = so.customer_id
                JOIN warehouses w ON w.warehouse_id = so.warehouse_id
                WHERE so.so_id = $1
                    AND so.tenant_id = $2
                    AND so.deleted_at IS NULL
            `;

            const values = [salesOrderId,tenantId]

            const result = await this.databaseService.query(query,values)

            if(result?.rows?.length === 0){
                throw new BadRequestException('Sales order not found')
            }

            return this.mapRowToSalesOrderDashboardData(result.rows[0])

        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while fetching sales order dashboard data')
        }
    }

    async getSalesOrderItemsDetails(salesOrderId: string,tenantId: string): Promise<SalesOrderItemsResponseDto>{
        try {
            const query = `
                SELECT 
                    p.product_name,
                    soi.quantity,
                    soi.selling_price,
                    soi.discount,
                    soi.line_total
                FROM sales_order_items soi
                JOIN products p ON soi.product_id = p.product_id AND p.deleted_at IS NULL
                WHERE soi.so_id = $1
                    AND soi.tenant_id = $2
            `;

            const values = [salesOrderId,tenantId]

            const result = await this.databaseService.query(query,values)

            const salesOrderItems = result?.rows?.map((row: any) => this.mapRowToSalesOrderProducts(row))

            return {
                items: salesOrderItems,
                totalPrice: salesOrderItems.reduce((acc,curr)=>{
                    return acc + Number(curr.totalPrice);
                },0)
            }

        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while fetching the order items')
        }
    }

    async deleteSalesOrder(salesOrderId: string,tenantId: string){
        try {
            const query = `
                UPDATE sales_orders so
                SET so.deleted_at = NOW()
                WHERE so.so_id = $1
                AND so.tenant_id = $2
                AND so.deleted_at IS NULL
            `;

            await this.databaseService.query(query,[salesOrderId,tenantId])

            return {message: 'Sales order deleted successfully'}
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while deleting sales order')
        }
    }

    async salesOrderOptions(tenantId: string){
        try {
            const query = `
                SELECT 
                    so.so_number AS label,
                    so.so_id AS value
                FROM sales_orders so
                WHERE so.tenant_id = $1
                AND so.deleted_at IS NULL
            `;

            const result = await this.databaseService.query(query,[tenantId])

            if(result?.rows?.length === 0) return []

            return result?.rows

        } catch (error) {
            throw new InternalServerErrorException('Internal server error while fetching sales order options')
        }
    }

    private mapRowToSalesOrderListResponse(row: any): SalesOrderListResponseDto{
        return {
            salesOrderId: row.so_id,
            salesOrderNumber: row.so_number,
            customerName: row.customer_name,
            warehouseName: row.warehouse_name,
            status: row.status,
            orderDate: row.order_date
        }
    }

    private mapRowToSalesOrderDashboardData(row: any): SalesOrderDashboardResponseDto {
        return {
            salesOrderId: row.so_id,
            salesOrderNumber: row.so_number,
            orderDate: row.order_date,
            orderStatus: row.status,
            totalAmount: row.sales_order_total_price,
            customerInfo: {
                customerName: row.customer_name,
                customerPhone: row.phone,
                customerEmail: row.email
            },
            warehouseInfo: {
                warehouseName: row.warehouse_name,
                warehouseAddress: row.address,
                warehouseContactPerson: row.contact_person,
                warehousePhone: row.warehouse_phone
            }
        }
    }

    private mapRowToSalesOrderProducts(row: any): SalesOrderItemsDto{
        return {
            productName: row.product_name,
            quantity: row.quantity,
            unitPrice: Number(row.selling_price),
            discount: Number(row.discount),
            totalPrice: Number(row.line_total)
        }
    }
}