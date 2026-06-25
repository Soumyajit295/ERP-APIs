import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentDirection, PaymentMethod } from "../enums/payment.enum";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { Type } from "class-transformer";

export class PaymentMessageResponseDto {
  @ApiProperty({ example: 'Payment created successfully' })
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class CreatePaymentDto {
  @ApiProperty({
    enum: PaymentDirection,
    example: PaymentDirection.RECEIVED,
  })
  @IsEnum(PaymentDirection)
  paymentDirection!: PaymentDirection;

  @ApiProperty({
    example: 10174.89,
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
  })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Required for incoming payments',
  })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Required for outgoing payments',
  })
  @IsOptional()
  @IsUUID()
  purchaseOrderId?: string;

  @ApiProperty({
    example: '2025-06-30',
  })
  @IsDateString()
  paymentDate!: string;

  @ApiPropertyOptional({
    example: 'TRF-20250630-001',
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({
    example: 'Payment received through bank transfer',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePaymentDto {
  @ApiPropertyOptional({
    example: '2025-07-01',
  })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({
    enum: PaymentMethod,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    example: 'TRF-UPDATED-001',
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({
    example: 'Updated payment remarks',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetPaymentsQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 10;

  @ApiPropertyOptional({
    enum: PaymentDirection,
  })
  @IsOptional()
  @IsEnum(PaymentDirection)
  paymentDirection?: PaymentDirection;

  @ApiPropertyOptional({
    example: 'PAY-2025',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class PaymentListResponseDto {
  @ApiProperty()
  paymentId!: string;

  @ApiProperty()
  paymentNumber!: string;

  @ApiProperty({
    enum: PaymentDirection,
  })
  paymentDirection!: PaymentDirection;

  @ApiProperty()
  customerOrSupplierName!: string;

  @ApiProperty()
  orderNumber!: string;

  @ApiProperty()
  paymentDate!: string;

  @ApiProperty({
    enum: PaymentMethod,
  })
  paymentMethod!: PaymentMethod;

  @ApiProperty()
  amount!: number;
}

export class PaymentPaginationMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

export class PaymentPaginatedResponseDto {
  @ApiProperty({
    type: [PaymentListResponseDto],
  })
  records!: PaymentListResponseDto[];

  @ApiProperty({
    type: PaymentPaginationMetaDto,
  })
  meta!: PaymentPaginationMetaDto;
}

export class PaymentEntityInformationDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  phone!: string;
}

export class InvoiceDto {
    @ApiProperty()
    invoiceId!: string;

    @ApiProperty()
    invoiceNumber!: string;

    @ApiProperty()
    issueDate!: string;

    @ApiProperty()
    dueDate!: string;

    @ApiProperty()
    totalAmount!: number;

    @ApiProperty()
    paidAmount!: number;

    @ApiProperty()
    balanceAmount!: number;

    @ApiProperty()
    status!: string;
}

export class PurchaseOrderDto {
    @ApiProperty()
    purchaseOrderId!: string;

    @ApiProperty()
    purchaseOrderNumber!: string;

    @ApiProperty()
    totalAmount!: number;

    @ApiProperty()
    paidAmount!: number;

    @ApiProperty()
    balanceAmount!: number;

    @ApiProperty()
    status!: string;
}

export class PaymentDetailsDto {
  @ApiProperty()
  paymentId!: string;

  @ApiProperty()
  paymentNumber!: string;

  @ApiProperty({
    enum: PaymentDirection,
  })
  paymentDirection!: PaymentDirection;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  paymentDate!: string;

  @ApiProperty({
    enum: PaymentMethod,
  })
  paymentMethod!: PaymentMethod;

  @ApiProperty()
  transactionId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({
    type: PaymentEntityInformationDto,
  })
  entityInformation!: PaymentEntityInformationDto;

  @ApiPropertyOptional({ type: InvoiceDto })
  relatedInvoice?: InvoiceDto;

  @ApiPropertyOptional({ type: PurchaseOrderDto })
  relatedPurchaseOrder?: PurchaseOrderDto;
}