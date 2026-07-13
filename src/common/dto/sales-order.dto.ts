import { Type } from 'class-transformer';
import {
  IsUUID,
  IsInt,
  IsNumber,
  Min,
  IsDateString,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  MaxLength
} from 'class-validator';
import { SalesOrderStatus } from '../enums/sales-order.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalesOrderItemDto {
  @ApiProperty({ format: 'uuid', example: 'b7c9a5e1-3f2d-4a6b-8c0e-1d2f3a4b5c6d' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ minimum: 1, example: 5 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ minimum: 0, example: 1500.00 })
  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @ApiProperty({ minimum: 0, example: 50.00 })
  @IsNumber()
  @Min(0)
  discount!: number;
}


export class CreateSalesOrderDto {
  @ApiProperty({ format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  customerId!: string;

  @ApiProperty({ format: 'uuid', example: 'd4e5f6a7-b8c9-0123-4567-890abcdef123' })
  @IsUUID()
  warehouseId!: string;

  @ApiProperty({ example: '2026-06-16' })
  @IsDateString()
  orderDate!: string;

  @ApiProperty({ type: [CreateSalesOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderItemDto)
  items!: CreateSalesOrderItemDto[];
}

export class UpdateSalesOrderStatusDto {
  @ApiProperty({ enum: SalesOrderStatus, example: SalesOrderStatus.CONFIRMED })
  @IsEnum(SalesOrderStatus)
  status!: SalesOrderStatus;
}

export class SalesOrderMessageResponseDto {
  @ApiProperty({ example: 'Sales order created successfully' })
  message!: string;
}

export class GetSalesOrderQueryDto {
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

  @ApiPropertyOptional({
    enum: SalesOrderStatus,
    example: SalesOrderStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(SalesOrderStatus)
  status?: SalesOrderStatus;

  @ApiPropertyOptional({ example: 'keyboard' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  search?: string;
}

export class SalesOrderListResponseDto {
  @ApiProperty({ format: 'uuid' })
  salesOrderId!: string;

  @ApiProperty({ example: 'SO-2026-1780829766072' })
  salesOrderNumber!: string;

  @ApiProperty({ example: 'ABC Traders' })
  customerName!: string;

  @ApiProperty({ example: 'Main Warehouse' })
  warehouseName!: string;

  @ApiProperty({
    enum: SalesOrderStatus,
    example: SalesOrderStatus.DRAFT,
  })
  status!: SalesOrderStatus;

  @ApiProperty({ example: '2026-06-07' })
  orderDate?: string;
}

export class SalesOrderPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class SalesOrderPaginatedResponseDto {
  @ApiProperty({ type: [SalesOrderListResponseDto] })
  records!: SalesOrderListResponseDto[];

  @ApiProperty({ type: SalesOrderPaginationMetaDto })
  meta!: SalesOrderPaginationMetaDto;
}

export class CustomerInformationDto {
  @ApiProperty({ example: 'ABC Traders' })
  customerName!: string

  @ApiPropertyOptional({ example: '+919876543210' })
  customerPhone?: string

  @ApiPropertyOptional({ example: 'abc@traders.com' })
  customerEmail?: string
}

export class WarehouseInformationDto {
  @ApiProperty({ example: 'Main Warehouse' })
  warehouseName!: string

  @ApiPropertyOptional({ example: 'John Doe' })
  warehouseContactPerson?: string

  @ApiPropertyOptional({ example: '123 Market Street' })
  warehouseAddress?: string

  @ApiPropertyOptional({ example: '+919876543210' })
  warehousePhone?: string
}

export class SalesOrderDashboardResponseDto {
  @ApiProperty({ format: 'uuid' })
  salesOrderId!: string

  @ApiProperty({ example: 'SO-2026-1780829766072' })
  salesOrderNumber!: string

  @ApiProperty({ example: '2026-06-16' })
  orderDate!: string

  @ApiProperty({ example: 15000.00 })
  totalAmount!: number

  @ApiProperty({ example: 'DRAFT' })
  orderStatus!: string

  @ApiProperty({ type: CustomerInformationDto })
  customerInfo!: CustomerInformationDto

  @ApiProperty({ type: WarehouseInformationDto })
  warehouseInfo!: WarehouseInformationDto
}

export class SalesOrderItemsDto {
  @ApiProperty({ example: 'Wireless Keyboard' })
  productName!: string

  @ApiProperty({ example: 5 })
  quantity!: number

  @ApiProperty({ example: 1500.00 })
  unitPrice!: number

  @ApiProperty({ example: 50.00 })
  discount!: number

  @ApiProperty({ example: 7250.00 })
  totalPrice!: number
}

export class SalesOrderItemsResponseDto {
  @ApiProperty({ type: [SalesOrderItemsDto] })
  items!: SalesOrderItemsDto[]

  @ApiProperty({ example: 15000.00 })
  totalPrice!: number
}

export class SalesOrderDetailsResponseDto {
  @ApiProperty({ format: 'uuid' })
  salesOrderId!: string

  @ApiProperty({ example: 'SO-2026-1780829766072' })
  salesOrderNumber!: string

  @ApiProperty({ example: '2026-06-16' })
  orderDate!: string

  @ApiProperty({ example: 15000.00 })
  totalAmount!: number

  @ApiProperty({ example: 'DRAFT' })
  orderStatus!: string

  @ApiProperty({ type: CustomerInformationDto })
  customerInfo!: CustomerInformationDto

  @ApiProperty({ type: WarehouseInformationDto })
  warehouseInfo!: WarehouseInformationDto

  @ApiProperty({ type: [SalesOrderItemsDto] })
  items!: SalesOrderItemsDto[]
}

export class SalesOrderOptionDto {
  @ApiProperty({ example: 'SO-2026-1780829766072' })
  label!: string;

  @ApiProperty({ format: 'uuid' })
  value!: string;
}