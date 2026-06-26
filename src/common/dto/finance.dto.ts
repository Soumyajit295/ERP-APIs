import { ApiProperty } from '@nestjs/swagger';

export class PaymentDto {
  @ApiProperty({
    example: 'PAY-001',
    description: 'Unique payment ID',
  })
  paymentId!: string;

  @ApiProperty({
    example: 'PMT-20250601',
    description: 'Payment number',
  })
  paymentNumber!: string;

  @ApiProperty({
    example: 'MADE',
    description: 'Type of payment',
  })
  paymentType!: string;

  @ApiProperty({
    example: '2026-06-26',
    description: 'Payment date',
  })
  paymentDate!: string;

  @ApiProperty({
    example: '1500.00',
    description: 'Payment amount',
  })
  paymentAmount!: number;
}

export class FinanceDashboardResponseDto {
  @ApiProperty({
    example: 25000,
    description: 'Total cash received',
  })
  cashIn!: number;

  @ApiProperty({
    example: 12000,
    description: 'Total cash paid out',
  })
  cashOut!: number;

  @ApiProperty({
    example: 8500,
    description: 'Outstanding receivables',
  })
  receivables!: number;

  @ApiProperty({
    example: 4300,
    description: 'Open payables',
  })
  openPayables!: number;

  @ApiProperty({
    type: [PaymentDto],
    description: 'List of recent payments',
  })
  recentPayments!: PaymentDto[];
}