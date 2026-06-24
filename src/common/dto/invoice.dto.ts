import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from "class-validator"
import { InvoiceStatus } from "../enums/invoice.enum"

export class createInvoiceDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    customerId!: string

    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    salesOrderId!: string

    @ApiProperty({ example: '2025-06-01' })
    @IsDateString()
    @IsNotEmpty()
    issueDate!: string

    @ApiProperty({ example: '2025-06-30' })
    @IsDateString()
    @IsNotEmpty()
    dueDate!: string

    @ApiPropertyOptional({ example: 'Payment due within 30 days' })
    @IsString()
    @IsOptional()
    notes?: string
}

export class updateInvoiceDto {
    @ApiPropertyOptional({ example: '2025-07-15' })
    @IsDateString()
    @IsOptional()
    dueDate?: string

    @ApiPropertyOptional({ example: 'Updated payment terms' })
    @IsString()
    @IsOptional()
    notes?: string
}

export class GetInvoiceQueryDto {
    @ApiPropertyOptional({ minimum: 1, default: 1, example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page = 1;

    @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10, example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit = 10;

    @ApiPropertyOptional({ format: 'uuid' })
    @IsOptional()
    @IsUUID()
    customerId?: string;

    @ApiPropertyOptional({ format: 'uuid' })
    @IsOptional()
    @IsUUID()
    salesOrderId?: string;

    @ApiPropertyOptional({
        enum: InvoiceStatus,
        example: InvoiceStatus.UNPAID,
    })
    @IsOptional()
    @IsString()
    status?: InvoiceStatus;

    @ApiPropertyOptional({ example: 'keyboard' })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    search?: string;
}

export class InvoicePaginationMetaDto {
    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 10 })
    limit!: number;

    @ApiProperty({ example: 42 })
    total!: number;

    @ApiProperty({ example: 5 })
    totalPages!: number;
}

export class InvoiceListResponseDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    invoiceId!: string

    @ApiProperty({ example: 'INV-2025-1712345678901' })
    invoiceNumber!: string

    @ApiProperty({ example: 'Acme Corp' })
    customername!: string

    @ApiProperty({ example: 'billing@acme.com' })
    customerEmail!: string

    @ApiProperty({ example: '2025-06-01' })
    issueDate!: string

    @ApiProperty({ example: '2025-06-30' })
    dueDate!: string

    @ApiProperty({ example: 15000 })
    totalAmount!: number

    @ApiProperty({ example: 5000 })
    paidAmount!: number

    @ApiProperty({ example: InvoiceStatus.UNPAID })
    status!: string
}

export class InvoicePaginatedResponseDto {
    @ApiProperty({ type: [InvoiceListResponseDto] })
    records!: InvoiceListResponseDto[];

    @ApiProperty({ type: InvoicePaginationMetaDto })
    meta!: InvoicePaginationMetaDto;
}

export class CustomerInformationDto {
  @ApiProperty({
    example: 'John Doe',
  })
  customerName!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
  })
  customerEmail!: string;
}

export class InvoiceDashboardDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  invoiceId!: string;

  @ApiProperty({
    example: 'INV-2025-001',
  })
  invoiceNumber!: string;

  @ApiProperty({
    example: '2025-06-01',
  })
  issueDate!: Date;

  @ApiProperty({
    example: '2025-06-30',
  })
  dueDate!: Date;

  @ApiProperty({
    example: 10000,
  })
  totalAmount!: number;

  @ApiProperty({
    example: 4000,
  })
  paidAmount!: number;

  @ApiProperty({
    example: 6000,
  })
  balanceAmount!: number;

  @ApiProperty({
    example: InvoiceStatus.PARTIALLY_PAID,
  })
  status!: InvoiceStatus;

  @ApiProperty({
    type: CustomerInformationDto,
  })
  customerInformation!: CustomerInformationDto;
}

export class InvoiceItems {
  @ApiProperty({
    example: 'Laptop',
  })
  productName!: string;

  @ApiProperty({
    example: 2,
  })
  quantity!: number;

  @ApiProperty({
    example: 50000,
  })
  unitPrice!: number;

  @ApiProperty({
    example: 5000,
  })
  discount!: number;

  @ApiProperty({
    example: 95000,
  })
  total!: number;
}

export class InvoiceItemsDto {
    @ApiProperty({ type: [InvoiceItems] })
    items!: InvoiceItems[];

    @ApiProperty({
        example: 100000,
    })
    subTotal!: number;
}

export class InvoiceMessageResponseDto {
    @ApiProperty({ example: 'Invoice created successfully' })
    message!: string;
}

export class InvoiceBySalesOrderResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  invoiceId!: string;

  @ApiProperty({ example: 'INV-2025-1712345678901' })
  invoiceNumber!: string;

  @ApiProperty({ example: '2025-06-01' })
  issueDate!: string;

  @ApiProperty({ example: '2025-06-30' })
  dueDate!: string;

  @ApiProperty({ example: 15000 })
  totalAmount!: number;

  @ApiProperty({ example: 5000 })
  paidAmount!: number;

  @ApiProperty({ example: InvoiceStatus.PAID })
  status!: string;
}