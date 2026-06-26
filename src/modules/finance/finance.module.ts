import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { FinanceRepository } from 'src/repositories/finance.repository';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [FinanceController],
  providers: [FinanceService,FinanceRepository,DatabaseService]
})
export class FinanceModule {}
