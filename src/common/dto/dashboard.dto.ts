import { ApiProperty } from '@nestjs/swagger';

export class DashboardTrendCardDto {
  @ApiProperty({ example: 120 })
  count!: number;

  @ApiProperty({ example: 12.5 })
  percentage!: number;

  @ApiProperty({ example: 'UP', enum: ['UP', 'DOWN', 'SAME'] })
  trend!: 'UP' | 'DOWN' | 'SAME';
}

export class DashboardRevenueCardDto {
  @ApiProperty({ example: 50000 })
  value!: number;

  @ApiProperty({ example: 8.3 })
  percentage!: number;

  @ApiProperty({ example: 'UP', enum: ['UP', 'DOWN', 'SAME'] })
  trend!: 'UP' | 'DOWN' | 'SAME';
}

export class DashboardRevenueDetailDto {
  @ApiProperty({ example: 1 })
  month!: number;

  @ApiProperty({ example: 12500 })
  revenue!: number;

  @ApiProperty({ example: 15 })
  orderCount!: number;
}

export class DashboardResponseDto {
  @ApiProperty({ type: DashboardTrendCardDto })
  orders!: DashboardTrendCardDto;

  @ApiProperty({ type: DashboardTrendCardDto })
  pendingPayments!: DashboardTrendCardDto;

  @ApiProperty({ example: 75000 })
  inventoryValue!: number;

  @ApiProperty({ type: DashboardRevenueCardDto })
  revenue!: DashboardRevenueCardDto;

  @ApiProperty({ type: [DashboardRevenueDetailDto] })
  revenueDetails!: DashboardRevenueDetailDto[];
}
