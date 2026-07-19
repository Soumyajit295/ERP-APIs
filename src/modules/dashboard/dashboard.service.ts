import { Injectable } from '@nestjs/common';
import { DashboardRepository } from 'src/repositories/dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getDashboardData(tenantId: string) {
    return await this.dashboardRepository.getDashboardData(tenantId);
  }
}
