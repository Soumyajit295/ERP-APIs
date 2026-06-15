import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateSalesOrderDto, UpdateSalesOrderStatusDto } from "src/common/dto/sales-order.dto";
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
            AND deleted_at IS NULL
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
            AND deleted_at IS NULL
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
            AND deleted_at IS NULL
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
            AND deleted_at IS NULL
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

            throw new InternalServerErrorException('Internal server error while updating sales order status');
        }
    }


    private mapRowToSalesOrderProducts(row: any){
        return {
            productId: row.product_id,
            quantity: row.quantity,
            sellingPrice: row.selling_price,
            discount: row.discount,
            lineTotal: row.line_total
        }
    }
}