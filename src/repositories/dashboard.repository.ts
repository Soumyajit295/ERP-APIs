import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InvoiceStatus } from 'src/common/enums/invoice.enum';
import { PaymentDirection } from 'src/common/enums/payment.enum';
import { SalesOrderStatus } from 'src/common/enums/sales-order.enum';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class DashboardRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getDashboardOrdersData(tenantId: string) {
    try {
      const totalSalesOrderQuery = `
                SELECT 
                    COUNT(*)::INT AS total_orders
                FROM sales_orders so
                WHERE so.tenant_id = $1
                AND so.status = $2
                AND so.deleted_at IS NULL
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

      const values = [tenantId, SalesOrderStatus.COMPLETED];

      const [totalSalesOrderResult, salesOrderResult] = await Promise.all([
        this.databaseService.query(totalSalesOrderQuery, values),
        this.databaseService.query(salesOrderQuery, values),
      ]);

      const currentSalesOrdersCount = salesOrderResult?.rows[0]?.current_month;
      const previousMonthSalesOrderCount =
        salesOrderResult?.rows[0]?.previous_month;

      const percentage =
        previousMonthSalesOrderCount == 0
          ? currentSalesOrdersCount > 0
            ? 100
            : 0
          : ((currentSalesOrdersCount - previousMonthSalesOrderCount) /
              previousMonthSalesOrderCount) *
            100;

      return {
        count: totalSalesOrderResult?.rows[0]?.total_orders,
        percentage: Number(percentage.toFixed(1)),
        trend:
          currentSalesOrdersCount > previousMonthSalesOrderCount
            ? 'UP'
            : currentSalesOrdersCount < previousMonthSalesOrderCount
              ? 'DOWN'
              : 'SAME',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Inernal server error while fetching orders data for dashboard',
      );
    }
  }

  async getPendingPayment(tenantId: string) {
    const totalPendingPaymentQuery = `
            SELECT 
                COALESCE(SUM(i.balance_amount),0) AS pending_payments
            FROM invoices i
            WHERE i.tenant_id = $1
            AND i.status = ANY($2::invoice_status_enum[])
        `;

    const pendingPaymentsQuery = `
            SELECT 
                COUNT(*) FILTER(
                    WHERE DATE_TRUNC('month',i.issue_date) = DATE_TRUNC('month',CURRENT_DATE)
                ) AS current_month,

                COUNT(*) FILTER(
                    WHERE DATE_TRUNC('month',i.issue_date) = DATE_TRUNC('month',CURRENT_DATE) - INTERVAL '1 month'
                ) AS previous_month
            FROM invoices i
            WHERE i.tenant_id = $1
            AND i.status = ANY($2::invoice_status_enum[])
        `;

    const values = [
      tenantId,
      [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID],
    ];

    const [pendingPaymentsResult, paymentResult] = await Promise.all([
      this.databaseService.query(totalPendingPaymentQuery, values),
      this.databaseService.query(pendingPaymentsQuery, values),
    ]);

    const current = paymentResult?.rows[0]?.current_month;
    const previous = paymentResult?.rows[0]?.previous_month;

    const percentage =
      previous == 0
        ? current > 0
          ? 100
          : 0
        : ((current - previous) / previous) * 100;

    return {
      totalPendingPayment: pendingPaymentsResult?.rows[0]?.pending_payments,
      percentage: Number(percentage.toFixed(1)),
      trend: current > previous ? 'UP' : current < previous ? 'DOWN' : 'SAME',
    };
  }

  async getInventoryValue(tenantId: string) {
    const query = `
            SELECT
                COALESCE(SUM(i.quantity * p.purchase_price), 0) AS inventory_value
            FROM inventory i
            JOIN products p
                ON p.product_id = i.product_id
            WHERE i.tenant_id = $1
            AND p.deleted_at IS NULL
        `;

    const result = await this.databaseService.query(query, [tenantId]);

    return Number(result.rows[0].inventory_value);
  }

  async getTotalRevenueCard(tenantId: string) {
    try {
      const query = `
            SELECT
                COALESCE(SUM(p.amount), 0) AS total_revenue,

                COALESCE(
                    SUM(
                        CASE
                        WHEN DATE_TRUNC('month', p.payment_date) = DATE_TRUNC('month', CURRENT_DATE)
                        THEN p.amount
                        END
                    ),
                    0
                ) AS current_month_revenue,

                COALESCE(
                    SUM(
                        CASE
                        WHEN DATE_TRUNC('month', p.payment_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                        THEN p.amount
                        END
                    ),
                    0
                ) AS previous_month_revenue

            FROM payments p
            WHERE p.tenant_id = $1
                AND p.payment_direction = $2
                AND p.deleted_at IS NULL
            `;

      const result = await this.databaseService.query(query, [
        tenantId,
        PaymentDirection.RECEIVED,
      ]);

      const { total_revenue, current_month_revenue, previous_month_revenue } =
        result.rows[0];

      const totalRevenue = Number(total_revenue);
      const currentMonthRevenue = Number(current_month_revenue);
      const previousMonthRevenue = Number(previous_month_revenue);

      let percentage = 0;

      if (previousMonthRevenue > 0) {
        percentage =
          ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100;
      } else if (currentMonthRevenue > 0) {
        percentage = 100;
      }

      let trend: 'UP' | 'DOWN' | 'SAME' = 'SAME';

      if (currentMonthRevenue > previousMonthRevenue) {
        trend = 'UP';
      } else if (currentMonthRevenue < previousMonthRevenue) {
        trend = 'DOWN';
      }

      return {
        value: totalRevenue,
        percentage: Number(percentage.toFixed(1)),
        trend,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error while fetching total revenue card',
      );
    }
  }

  async getRevenueDetails(tenantId: string) {
    try {
      const query = `
            WITH revenue AS (
                SELECT
                    EXTRACT(MONTH FROM payment_date) AS month,
                    SUM(amount) AS revenue
                FROM payments
                WHERE tenant_id = $1
                AND payment_direction = $2
                GROUP BY EXTRACT(MONTH FROM payment_date)
            ),
            orders AS (
                SELECT
                    EXTRACT(MONTH FROM order_date) AS month,
                    COUNT(*) AS orders_count
                FROM sales_orders
                WHERE tenant_id = $1
                GROUP BY EXTRACT(MONTH FROM order_date)
            )

            SELECT
                COALESCE(r.month, o.month) AS month,
                COALESCE(r.revenue, 0) AS revenue,
                COALESCE(o.orders_count, 0) AS orders_count
            FROM revenue r
            FULL OUTER JOIN orders o
            ON r.month = o.month
            ORDER BY month;
        `;

      const result = await this.databaseService.query(query, [
        tenantId,
        PaymentDirection.RECEIVED,
      ]);

      return (
        result?.rows?.map((row: any) => this.mapRowToRevenueDetails(row)) ?? []
      );
    } catch (error) {}
  }

  async getDashboardData(tenantId: string) {
    const [orders, pendingPayments, inventoryValue, revenue, revenueDetails] =
      await Promise.all([
        this.getDashboardOrdersData(tenantId),
        this.getPendingPayment(tenantId),
        this.getInventoryValue(tenantId),
        this.getTotalRevenueCard(tenantId),
        this.getRevenueDetails(tenantId),
      ]);

    return {
      orders,
      pendingPayments: {
        count: pendingPayments.totalPendingPayment,
        percentage: pendingPayments.percentage,
        trend: pendingPayments.trend,
      },
      inventoryValue,
      revenue,
      revenueDetails,
    };
  }

  private mapRowToRevenueDetails(row: any) {
    return {
      month: row.month,
      revenue: row.revenue,
      orderCount: row.orders_count,
    };
  }
}
