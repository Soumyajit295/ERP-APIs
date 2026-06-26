import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InvoiceStatus } from "src/common/enums/invoice.enum";
import { PaymentDirection } from "src/common/enums/payment.enum";
import { PaymentStatus } from "src/common/enums/purchase-order.enum";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class FinanceRepository {
    constructor(
        private readonly databaseService: DatabaseService
    ){}

    async getCashIn(tenantId: string){
        try {
            const query = `
                SELECT
                    COALESCE(SUM(po.amount),0) AS cash_in
                FROM payments po
                WHERE po.tenant_id = $1
                AND po.payment_direction = $2
            `;
    
            const result = await this.databaseService.query(query,[tenantId,PaymentDirection.RECEIVED])
    
            return Number(result?.rows[0]?.cash_in)
        } catch (error) {
            throw new InternalServerErrorException('Internal server error while fetching cash in data')
        }
    }

    async getCashOut(tenantId: string){
        try {
            const query = `
                SELECT
                    COALESCE(SUM(po.amount),0) AS cash_out
                FROM payments po
                WHERE po.tenant_id = $1
                AND po.payment_direction = $2
            `;
    
            const result = await this.databaseService.query(query,[tenantId,PaymentDirection.MADE])
    
            return Number(result?.rows[0]?.cash_out)
        } catch (error) {
            throw new InternalServerErrorException('Internal server error while fetching cash out data')
        }
    }

    async getReceivables(tenantId: string){
        try {
            const query = `
                SELECT 
                    COALESCE(SUM(i.balance_amount),0) AS receivables
                FROM invoices i
                WHERE i.tenant_id = $1
                AND i.status IN ($2,$3)
            `
    
            const result = await this.databaseService.query(query,[tenantId,InvoiceStatus.UNPAID,InvoiceStatus.PARTIALLY_PAID])
    
            return Number(result?.rows[0]?.receivables)
        } catch (error) {
            throw new InternalServerErrorException('Internal server error while fetching receivables data')
        }
    }

    async getOpenPayables(tenantId: string){
        try {
            const query = `
                SELECT 
                    COALESCE(SUM(po.balance_amount),0) AS open_payables
                FROM purchase_orders po
                WHERE po.tenant_id = $1
                AND po.payment_status IN ($2,$3)
            `;

            const result = await this.databaseService.query(query,[tenantId,PaymentStatus.UNPAID,PaymentStatus.PARTIALLY_PAID])

            return Number(result?.rows[0]?.open_payables)
        } catch (error) {
            throw new InternalServerErrorException('Internal server error while fetching openPayables data')
        }
    }

    async getRecentPayments(tenantId: string){
        try {
            const query = `
                SELECT
                    p.payment_id,
                    p.payment_number,
                    p.payment_direction,
                    p.payment_date,
                    p.amount
                FROM payments p
                WHERE p.tenant_id = $1
                ORDER BY p.created_at DESC
                LIMIT $2
            `;

            const result = await this.databaseService.query(query,[tenantId,10])

            return result?.rows?.map((row: any) => this.mapRowToPayments(row)) ?? []

        } catch (error) {
            throw new InternalServerErrorException('Internal server error while fetching recent payments')
        }
    }

    private mapRowToPayments(row: any) {
        return {
            paymentId: row.payment_id,
            paymentNumber: row.payment_number,
            paymentType: row.payment_direction,
            paymentDate: row.payment_date,
            paymentAmount: Number(row.amount)
        }
    }
}