import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InvoiceStatus } from "src/common/enums/invoice.enum";
import { SalesOrderStatus } from "src/common/enums/sales-order.enum";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class DashboardRepository {
    constructor(
        private readonly databaseService: DatabaseService
    ){}

    async getDashboardOrdersData(tenantId: string){
        try {
            const totalSalesOrderQuery = `
                SELECT 
                    COUNT(*)::INT AS total_orders
                FROM sales_orders so
                WHERE so.tenant_id = $1
                AND so.status = $2
                AND so.deletd_at IS NULL
            `;


            const salesOrderQuery = `
                SELECT
                    COUNT(*) FILTER (
                        WHERE DATE_TRUNC('month', so.order_date) = DATE_TRUNC('month', CURRENT_DATE)
                    ) AS current_month,

                    COUNT(*) FILTER (
                        WHERE DATE_TRUNC('month', so.order_date) = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
                    ) AS previous_month
                FROM sales_orders so
                WHERE so.tenant_id = $1
                AND so.status = $2
                AND so.deleted_at IS NULL;
            `;

            const values = [tenantId,SalesOrderStatus.COMPLETED]

            const [totalSalesOrderResult,salesOrderResult] = await Promise.all([
                this.databaseService.query(totalSalesOrderQuery,values),
                this.databaseService.query(salesOrderQuery,values)
            ])

            const currentSalesOrdersCount = salesOrderResult?.rows[0]?.current_month
            const previousMonthSalesOrderCount = salesOrderResult?.rows[0]?.previous_month

            const percentage = previousMonthSalesOrderCount == 0 ? (currentSalesOrdersCount > 0 ? 100 : 0): ((currentSalesOrdersCount - previousMonthSalesOrderCount) / previousMonthSalesOrderCount) * 100

            return {
                count: totalSalesOrderResult?.rows[0]?.total_orders,
                percentage: Number(percentage.toFixed(1)),
                trend: currentSalesOrdersCount > previousMonthSalesOrderCount ? 'UP' : currentSalesOrdersCount < previousMonthSalesOrderCount ? 'DOWN' : 'SAME'
            }
            
        } catch (error: any) {
            throw new InternalServerErrorException('Inernal server error while fetching orders data for dashboard')
        }
    }

    async getPendingPayment(tenantId: string){
        const totalPendingPaymentQuery = `
            SELECT 
                COALESCE(SUM(i.balance_amount),0) AS pending_payments
            FROM invoices i
            WHERE i.tenant_id = $1
            AND i.status IN ($2)
            AND i.deleted_at IS NULL
        `;

        const pendingPaymentsQuery = `
            SELECT 
                COUNT(*) FILTER(
                    WHERE DATE_TRUNC('month',i.issue_date) = DATE_TRUNC('month',CURRENT_DATE)
                ) AS current_month,

                COUNT(*) FILTER(
                    WHERE DATE TRUNC('month',i.issue_date) = DATE_TRUNC('month',CURRENT_DATE) - INTERVAL '1 month'
                ) AS previous_month
            FROM invoices i
            WHERE i.tenant_id = $1
            AND i.status IN ($2)
            AND i.deleted_at IS NULL
        `

        const values = [tenantId,[InvoiceStatus.UNPAID,InvoiceStatus.PARTIALLY_PAID]]

        const [pendingPaymentsResult,paymentResult] = await Promise.all([
            this.databaseService.query(totalPendingPaymentQuery,values),
            this.databaseService.query(pendingPaymentsQuery,values)
        ])

        const current = paymentResult?.rows[0]?.current_month
        const previous = paymentResult?.rows[0]?.previous_month

        const percentage = previous == 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous)*100

        return {
            totalPendingPayment: pendingPaymentsResult?.rows[0]?.pending_payments,
            percentage: Number(percentage.toFixed(1)),
            trend: current > previous ? 'UP' : current < previous ? 'DOWN' : 'SAME'
        }
    }
}