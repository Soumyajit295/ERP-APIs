import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreatePaymentDto, GetPaymentsQueryDto, PaymentDetailsDto, PaymentListResponseDto, PaymentPaginatedResponseDto } from "src/common/dto/payment.dto";
import { PaymentDirection } from "src/common/enums/payment.enum";
import { DatabaseService } from "src/database/database.service";
import { InvoiceRepository } from "./invoice.repository";
import { PaymentStatus } from "src/common/enums/purchase-order.enum";
import { InvoiceStatus } from "src/common/enums/invoice.enum";
import { PurchaseOrderRepository } from "./purchaseOrder.repository";

@Injectable()
export class PaymentRepository {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly purchaseOrderRepository: PurchaseOrderRepository,
        private readonly invoiceRepository: InvoiceRepository
    ){}

    async createPayment(createPaymentDto: CreatePaymentDto,tenantId: string,entityData: any){
        return await this.databaseService.transaction(async(client: any) => {
            try {
                if (createPaymentDto.amount > entityData.balanceAmount) {
                    throw new BadRequestException('Payment amount exceeds the outstanding balance')
                }

                const paymentNumber = `PAY-${new Date().getFullYear()}-${Date.now()}`
                const query = `
                    INSERT INTO payments(
                        tenant_id,
                        payment_number,
                        invoice_id,
                        purchase_order_id,
                        payment_direction,
                        amount,
                        payment_method,
                        payment_date,
                        transaction_id,
                        notes
                    )
                    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                    RETURNING payment_id
                `;

                const values = [
                    tenantId,
                    paymentNumber,
                    createPaymentDto.invoiceId,
                    createPaymentDto.purchaseOrderId,
                    createPaymentDto.paymentDirection,
                    createPaymentDto.amount,
                    createPaymentDto.paymentMethod,
                    createPaymentDto.paymentDate,
                    createPaymentDto.transactionId,
                    createPaymentDto.notes
                ]

                const result = await client.query(query,values)

                if(result?.rows?.length === 0){
                    throw new BadRequestException('Failed to create payment')
                }

                const isFullPayment = entityData.balanceAmount === createPaymentDto.amount

                if(createPaymentDto.paymentDirection === PaymentDirection.RECEIVED){
                    const paymentStatus = isFullPayment ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID
                    await this.invoiceRepository.updateInvoicePaymentStatus(entityData.invoiceId,tenantId,createPaymentDto.amount,paymentStatus,client)
                } else {
                    const paymentStatus = isFullPayment ? PaymentStatus.PAID : PaymentStatus.PARTIALLY_PAID
                    await this.purchaseOrderRepository.updatePurchaseOrderPaymentStatus(entityData.purchaseOrderId,tenantId,createPaymentDto.amount,paymentStatus,client)
                }

                return {message: 'Payment created successfully'}
            } catch (error) {
                if(error instanceof BadRequestException){
                    throw error
                }
                throw new InternalServerErrorException('Internal server error while creating payment')
            }
        })
    }

    async getPaginatedPayments(getPaymentQueryDto: GetPaymentsQueryDto,tenantId: string): Promise<PaymentPaginatedResponseDto>{
        const {
            page = 1,
            limit = 10,
            paymentDirection,
            search
        } = getPaymentQueryDto

        const currentPage = Math.max(Number(page),1)
        const pageLimit = Math.min(Math.max(Number(limit),1),100)
        const offset = (currentPage - 1) * pageLimit
        const paymentDirectionParams = paymentDirection ?? null
        const searchParams = search ?? null

        try {
            const countQuery = `
                SELECT COUNT(*)::INT AS total
                FROM payments p
                WHERE p.tenant_id = $1
                AND p.deleted_at IS NULL
                AND(
                    $2::payment_direction_enum IS NULL
                    OR p.payment_direction = $2
                )
                AND(
                    $3::text IS NULL
                    OR p.payment_number ILIKE '%' || $3 || '%'
                )
            `;

            const countValues = [tenantId,paymentDirectionParams,searchParams]

            const paymentQuery = `
                SELECT 
                    p.payment_id,
                    p.payment_number,
                    p.payment_direction,
                    p.payment_method,
                    p.amount,
                    p.payment_date,
                    COALESCE(c.customer_name, s.supplier_name) AS entity_name,
                    COALESCE(i.invoice_number, po.po_number) AS order_number
                FROM payments p
                LEFT JOIN invoices i ON i.invoice_id = p.invoice_id AND i.deleted_at IS NULL
                LEFT JOIN customers c ON c.customer_id = i.customer_id AND c.deleted_at IS NULL
                LEFT JOIN purchase_orders po ON po.po_id = p.purchase_order_id AND po.deleted_at IS NULL
                LEFT JOIN suppliers s ON s.supplier_id = po.supplier_id AND s.deleted_at IS NULL
                WHERE p.tenant_id = $1
                AND p.deleted_at IS NULL
                AND(
                    $4::payment_direction_enum IS NULL
                    OR p.payment_direction = $4
                )
                AND(
                    $5::text IS NULL
                    OR p.payment_number ILIKE '%' || $5 || '%'
                )
                ORDER BY p.created_at DESC
                LIMIT $2
                OFFSET $3
            `;

            const paymentValues = [
                tenantId,
                pageLimit,
                offset,
                paymentDirectionParams,
                searchParams
            ]

            const [countResult,paymentResult] = await Promise.all([
                this.databaseService.query(countQuery,countValues),
                this.databaseService.query(paymentQuery,paymentValues)
            ]) 

            const total = countResult?.rows[0]?.total ?? 0
            const totalPages = total > 0 ? Math.ceil(total / pageLimit) : 0

            return {
                records: paymentResult?.rows?.map((row: any) => this.mapRowToPaymentListResponse(row)) ?? [],
                meta: {
                    page: currentPage,
                    limit: pageLimit,
                    total,
                    totalPages
                }
            }

        } catch (error) {
            throw new InternalServerErrorException('Internal server error while fetching payments')
        }
    }

    async getPaymentDashboardData(paymentId: string,tenantId: string){
        try {
            const query = `
                SELECT
                    p.payment_id,
                    p.payment_number,
                    p.amount,
                    p.payment_date,
                    p.payment_method,
                    p.payment_direction,
                    p.transaction_id,
                    p.created_at,
                    p.updated_at,
                    p.notes,
                    COALESCE(c.customer_name, s.supplier_name) AS entity_name,
                    COALESCE(c.email, s.email) AS email,
                    COALESCE(c.phone, s.phone) AS phone,
                    i.invoice_id,
                    i.invoice_number,
                    i.issue_date,
                    i.due_date,
                    i.total_amount AS invoice_total_amount,
                    i.paid_amount AS invoice_paid_amount,
                    i.balance_amount AS invoice_balance_amount,
                    i.status AS invoice_status,
                    po.po_id,
                    po.po_number,
                    po.total_amount AS po_total_amount,
                    po.paid_amount AS po_paid_amount,
                    po.balance_amount AS po_balance_amount,
                    po.payment_status AS po_status
                FROM payments p
                LEFT JOIN invoices i ON i.invoice_id = p.invoice_id AND i.deleted_at IS NULL
                LEFT JOIN customers c ON c.customer_id = i.customer_id AND c.deleted_at IS NULL
                LEFT JOIN purchase_orders po ON po.po_id = p.purchase_order_id AND po.deleted_at IS NULL
                LEFT JOIN suppliers s ON s.supplier_id = po.supplier_id AND s.deleted_at IS NULL
                WHERE p.payment_id = $1
                AND p.tenant_id = $2
                AND p.deleted_at IS NULL
            `;

            const result = await this.databaseService.query(query,[paymentId,tenantId])

            if(result?.rows?.length === 0){
                throw new BadRequestException('Payment details not found')
            }

            return this.mapRowToPaymentDashboardResponse(result?.rows[0])
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error
            }

            throw new InternalServerErrorException('Internal server error while fetching payment details')
        }
    }

    private mapRowToPaymentListResponse(row: any): PaymentListResponseDto {
        return {
            paymentId: row.payment_id,
            paymentNumber: row.payment_number,
            paymentDirection: row.payment_direction,
            customerOrSupplierName: row.entity_name,
            orderNumber: row.order_number,
            paymentDate: row.payment_date,
            amount: Number(row.amount),
            paymentMethod: row.payment_method
        }
    }

    private mapRowToPaymentDashboardResponse(row: any): PaymentDetailsDto {
        const response: PaymentDetailsDto = {
            paymentId: row.payment_id,
            paymentNumber: row.payment_number,
            amount: Number(row.amount),
            paymentDate: row.payment_date,
            paymentMethod: row.payment_method,
            transactionId: row.transaction_id,
            paymentDirection: row.payment_direction,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            entityInformation: {
                name: row.entity_name ?? '',
                email: row.email ?? '',
                phone: row.phone ?? ''
            }
        }

        if (row.invoice_id) {
            response.relatedInvoice = {
                invoiceId: row.invoice_id,
                invoiceNumber: row.invoice_number,
                issueDate: row.issue_date,
                dueDate: row.due_date,
                totalAmount: Number(row.invoice_total_amount),
                paidAmount: Number(row.invoice_paid_amount),
                balanceAmount: Number(row.invoice_balance_amount),
                status: row.invoice_status
            }
        }

        if (row.po_id) {
            response.relatedPurchaseOrder = {
                purchaseOrderId: row.po_id,
                purchaseOrderNumber: row.po_number,
                totalAmount: Number(row.po_total_amount),
                paidAmount: Number(row.po_paid_amount),
                balanceAmount: Number(row.po_balance_amount),
                status: row.po_status
            }
        }

        return response
    }
}