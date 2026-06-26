import { Injectable } from '@nestjs/common';
import { FinanceDashboardResponseDto } from 'src/common/dto/finance.dto';
import { FinanceRepository } from 'src/repositories/finance.repository';

@Injectable()
export class FinanceService {
    constructor(
        private readonly financeRepository: FinanceRepository
    ){}

    async getFinaceDashboardData(tenantId: string): Promise<FinanceDashboardResponseDto>{
        const [
            cashInData,
            casoutData,
            receivablesData,
            openPayablesData,
            recentPayments
        ] = await Promise.all([
            this.financeRepository.getCashIn(tenantId),
            this.financeRepository.getCashOut(tenantId),
            this.financeRepository.getReceivables(tenantId),
            this.financeRepository.getOpenPayables(tenantId),
            this.financeRepository.getRecentPayments(tenantId)
        ])

        return {
            cashIn: cashInData,
            cashOut: casoutData,
            receivables: receivablesData,
            openPayables: openPayablesData,
            recentPayments
        }
    }
}
