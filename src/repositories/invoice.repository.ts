import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { createInvoiceDto, GetInvoiceQueryDto, InvoiceDashboardDto, InvoiceItems, InvoiceItemsDto, InvoiceListResponseDto, InvoicePaginatedResponseDto, updateInvoiceDto } from "src/common/dto/invoice.dto";
import { DatabaseService } from "src/database/database.service";
import { CustomerRepository } from "./customer.repository";
import { SalesOrdresRepository } from "./salesOrder.repository";
import { SalesOrderStatus } from "src/common/enums/sales-order.enum";


@Injectable()
export class InvoiceRepository {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly customerRepository: CustomerRepository,
        private readonly salesOrderRepository: SalesOrdresRepository
    ){}

    async createInvoice(createInvoiceDto: createInvoiceDto, tenantId: string) {
        try {
            const [customerData, salesOrderData] = await Promise.all([
                this.customerRepository.getCustomerById(createInvoiceDto.customerId, tenantId),
                this.salesOrderRepository.getSalesOrderById(createInvoiceDto.salesOrderId, tenantId)
            ])

            if (!salesOrderData) {
                throw new BadRequestException('Sales order not found')
            }

            if (!customerData) {
                throw new BadRequestException('Customer not found')
            }

            const existingInvoice = await this.databaseService.query(
                `SELECT invoice_id FROM invoices WHERE sales_order_id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
                [createInvoiceDto.salesOrderId, tenantId]
            )

            if (existingInvoice?.rows?.length > 0) {
                throw new BadRequestException('An invoice already exists for this sales order')
            }

            const statusResult = await this.databaseService.query(
                `SELECT status FROM sales_orders WHERE so_id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
                [createInvoiceDto.salesOrderId, tenantId]
            )

            const status = statusResult?.rows?.[0]?.status

            if (status !== SalesOrderStatus.COMPLETED) {
                throw new BadRequestException('Sales order is not in a valid state for invoicing')
            }

            if (new Date(createInvoiceDto.issueDate) > new Date(createInvoiceDto.dueDate)) {
                throw new BadRequestException('Issue date cannot be after due date')
            }

            const salesOrderItems = await this.salesOrderRepository.getSalesOrderItemsDetails(createInvoiceDto.salesOrderId, tenantId)

            if (!salesOrderItems?.items?.length) {
                throw new BadRequestException('Sales order has no items to invoice')
            }

            const subTotal = salesOrderItems.items.reduce((acc, curr) => {
                return acc + (Number(curr.unitPrice) * Number(curr.quantity))
            }, 0)

            const totalDiscountAmount = salesOrderItems.items.reduce((acc, curr) => {
                return acc + Number(curr.discount)
            }, 0)

            const totalAmount = salesOrderItems.items.reduce((acc, curr) => {
                return acc + Number(curr.totalPrice)
            }, 0)

            const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now()}`

            const createQuery = `
                INSERT INTO invoices(
                    tenant_id,
                    sales_order_id,
                    customer_id,
                    invoice_number,
                    issue_date,
                    due_date,
                    subtotal,
                    discount_amount,
                    total_amount,
                    balance_amount,
                    notes
                )
                VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                RETURNING invoice_id
            `

            const values = [
                tenantId,
                createInvoiceDto.salesOrderId,
                createInvoiceDto.customerId,
                invoiceNumber,
                createInvoiceDto.issueDate,
                createInvoiceDto.dueDate,
                subTotal,
                totalDiscountAmount,
                totalAmount,
                totalAmount,
                createInvoiceDto.notes ?? null
            ]

            const result = await this.databaseService.query(createQuery, values)

            return { message: 'Invoice created successfully' }
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error
            }
            throw new InternalServerErrorException('Internal server error while creating invoice')
        }
    }

    async getPaginatedInvoices(getInvoiceQueryDto: GetInvoiceQueryDto,tenantId: string): Promise<InvoicePaginatedResponseDto>{
        try {
            const {
                page = 1,
                limit = 10,
                customerId,
                salesOrderId,
                search,
                status
            } = getInvoiceQueryDto

            const currentPage = Math.max(Number(page),1)
            const pageLimit = Math.min(Math.max(Number(limit),1),100)
            const offset = (currentPage - 1) * pageLimit
            const customerIdSearchParams = customerId ?? null
            const salesOrderIdParams = salesOrderId ?? null
            const searchParams = search ?? null
            const statusParams = status ?? null

            const countQuery = `
                SELECT COUNT(*) FROM invoices i
                WHERE i.tenant_id = $1
                AND i.deleted_at IS NULL
                AND(
                    $2::uuid IS NULL
                    OR i.customer_id = $2
                )
                AND(
                    $3::uuid IS NULL
                    OR i.sales_order_id = $3
                )
                AND(
                    $4::text IS NULL
                    OR i.invoice_number ILIKE '%' || $4 || '%'
                )
                AND(
                    $5::invoice_status_enum IS NULL
                    OR i.status = $5
                )
            `;

            const countValues = [tenantId,customerIdSearchParams,salesOrderIdParams,searchParams,statusParams]

            const invoiceQuery = `
                SELECT
                    i.invoice_id,
                    i.invoice_number,
                    c.customer_name,
                    c.email,
                    i.issue_date,
                    i.due_date,
                    i.total_amount,
                    i.paid_amount,
                    i.status
                FROM invoices i
                JOIN customers c ON c.customer_id = i.customer_id AND c.deleted_at IS NULL
                WHERE i.tenant_id = $1
                AND i.deleted_at IS NULL
                AND(
                    $4::uuid IS NULL
                    OR i.customer_id = $4
                )
                AND(
                    $5::uuid IS NULL
                    OR i.sales_order_id = $5
                )
                AND(
                    $6::text IS NULL
                    OR i.invoice_number ILIKE '%' || $6 || '%'
                )
                AND(
                    $7::invoice_status_enum IS NULL
                    OR i.status = $7
                )
                ORDER BY i.created_at DESC
                LIMIT $2
                OFFSET $3
            `;

            const invoiceValues = [tenantId,pageLimit,offset,customerIdSearchParams,salesOrderIdParams,searchParams,statusParams]

            const [countResult,invoiceResult] = await Promise.all([
                this.databaseService.query(countQuery,countValues),
                this.databaseService.query(invoiceQuery,invoiceValues)
            ])

            const total = countResult?.rows[0]?.total ?? 0
            const totalPages = Math.ceil(total/pageLimit)

            return {
                records: invoiceResult?.rows?.map((row: any) => this.mapRowToInvoice(row)) ?? [],
                meta: {
                    page: currentPage,
                    limit: pageLimit,
                    total,
                    totalPages
                }
            }

        } catch (error) {
            throw new InternalServerErrorException('Internal server error while fetching invoices')
        }
    }

    async getInvoiceById(invoiceId: string,tenantId: string){
        try {
            const query = `
                SELECT 
                    i.invoice_id,
                    i.issue_date,
                    i.due_date
                FROM invoices i
                WHERE i.invoice_id = $1
                AND i.tenant_id = $2
                AND i.deleted_at IS NULL
            `;

            const result = await this.databaseService.query(query,[invoiceId,tenantId])

            if(!result?.rows?.length) return null

            return {
                invoiceId: result?.rows[0]?.invoice_id,
                issueDate: result?.rows[0]?.issue_date,
                dueDate: result?.rows[0]?.due_date
            }

        } catch (error) {
            throw new InternalServerErrorException('Internal server error while fetching invoice by invoice id')
        }
    }

    async updateInvoiceDetails(updateInvoiceDto: updateInvoiceDto,invoiceId: string,tenantId: string){
        try {
            const invoiceData = await this.getInvoiceById(invoiceId,tenantId)

            if(!invoiceData){
                throw new BadRequestException('Failed to find invoice data')
            }

            if(updateInvoiceDto?.dueDate){
                if(new Date(invoiceData.issueDate) > new Date(updateInvoiceDto.dueDate)){
                    throw new BadRequestException('Due date should be grater then issue date of invoice')
                }
            }

            const updates: any[] = []
            const values: string[] = []
            let index = 1

            const mapValues = {
                dueDate: 'due_date',
                notes: 'notes'
            }
            
            Object.entries(updateInvoiceDto).forEach(([key,value]) => {
                if(value!==undefined){
                    updates.push(`${mapValues[key]} = $${index}`)
                    values.push(value)
                    index++
                }
            })

            if(updates.length === 0){
                throw new BadRequestException('At least one field has to updated')
            }

            values.push(invoiceId,tenantId)

            const updateQuery = `
                UPDATE invoices i
                SET ${updates.join(', ')}, i.updated_at = NOW()
                WHERE i.invoice_id = $${index}
                AND i.tenant_id = $${index+1}
                AND i.deleted_at IS NULL
            `;

            await this.databaseService.query(updateQuery,values)

            return {message: 'Invoice updated successfully'}
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error
            }
            throw new InternalServerErrorException('Internal server error while updating invoice details')
        }
    }

    async getInvoiceDashboardData(invoiceId: string,tenantId: string){
        try {
            const query = `
                SELECT 
                    i.invoice_id,
                    i.invoice_number,
                    i.issue_date,
                    i.due_date,
                    i.total_amount,
                    i.paid_amount,
                    i.balance_amount,
                    i.status,
                    c.customer_name,
                    c.email
                FROM invoices i
                JOIN customers c ON c.customer_id = i.customer_id AND c.deleted_at IS NULL
                WHERE i.invoice_id = $1
                AND i.tenant_id = $2
                AND i.deleted_at IS NULL
            `;

            const result = await this.databaseService.query(query,[invoiceId,tenantId])

            if(!result?.rows?.length){
                throw new BadRequestException('Invoice not found')
            }

            return this.mapRowToInvoiceDetails(result.rows[0])

        } catch (error) {
            if(error instanceof BadRequestException){
                throw error
            }
            throw new InternalServerErrorException('Internal server error, while fetching invoice dashboard data')
        }
    }

    async getInvoiceItems(invoiceId: string,tenantId: string): Promise<InvoiceItemsDto>{
        try {
            const query = `
                SELECT 
                    p.product_name,
                    soi.quantity,
                    soi.selling_price,
                    soi.discount,
                    soi.line_total
                FROM invoices i
                JOIN sales_order_items soi ON soi.so_id = i.sales_order_id
                JOIN products p ON p.product_id = soi.product_id AND p.deleted_at IS NULL
                WHERE i.invoice_id = $1
                AND i.tenant_id = $2
                AND i.deleted_at IS NULL
            `;

            const result = await this.databaseService.query(query,[invoiceId,tenantId])

            if(!result?.rows?.length){
                return { items: [], subTotal: 0 }
            }

            const items = result.rows.map((row: any) => this.mapRowToInvoiceItems(row))

            return {
                items, 
                subTotal: items.reduce((acc,curr) => {
                    return acc + curr.total
                },0)
            }

        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while fetching invoice items')
        }
    }

    async getInvoiceBySalesOrder(salesOrderId: string, tenantId: string){
        try {
            const query = `
                SELECT 
                    i.invoice_id,
                    i.invoice_number,
                    i.issue_date,
                    i.due_date,
                    i.total_amount,
                    i.paid_amount,
                    i.status
                FROM invoices i
                WHERE i.sales_order_id = $1
                AND i.tenant_id = $2
                AND i.deleted_at IS NULL
            `;

            const result = await this.databaseService.query(query,[salesOrderId,tenantId])

            const invoices = result?.rows?.map((row: any) => this.mapRowToSalesOrderInvoice(row)) ?? []

            return invoices

        } catch (error) {
            throw new InternalServerErrorException('Internal server error while fetching invoice opf sales order')
        }
    }

    private mapRowToInvoice(row: any): InvoiceListResponseDto {
        return {
            invoiceId: row.invoice_id,
            invoiceNumber: row.invoice_number,
            customername: row.customer_name,
            customerEmail: row.email,
            issueDate: row.issue_date,
            dueDate: row.due_date,
            totalAmount: row.total_amount,
            paidAmount: row.paid_amount,
            status: row.status
        }
    }

    private mapRowToInvoiceDetails(row: any): InvoiceDashboardDto {
        return {
            invoiceId: row.invoice_id,
            invoiceNumber: row.invoice_number,
            issueDate: row.issue_date,
            dueDate: row.due_date,
            totalAmount: row.total_amount,
            paidAmount: row.paid_amount,
            balanceAmount: row.balance_amount,
            status: row.status,
            customerInformation: {
                customerName: row.customer_name,
                customerEmail: row.email
            }
        }
    }

    private mapRowToInvoiceItems(row: any): InvoiceItems {
        return {
            productName: row.product_name,
            quantity: row.quantity,
            unitPrice: row.selling_price,
            discount: row.discount,
            total: row.line_total 
        }
    }

    private mapRowToSalesOrderInvoice(row: any) {
        return {
            invoiceId: row.invoice_id,
            invoiceNumber: row.invoice_number,
            issueDate: row.issue_date,
            dueDate: row.due_date,
            totalAmount: row.total_amount,
            paidAmount: row.paid_amount,
            status: row.status
        }
    }
}