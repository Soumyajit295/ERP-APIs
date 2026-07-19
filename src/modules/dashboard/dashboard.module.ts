import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from 'src/repositories/dashboard.repository';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository, DatabaseService],
})
export class DashboardModule {}
