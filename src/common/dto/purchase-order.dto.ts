import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PurchaseOrderStatus } from '../enums/purchase-order.enum';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseOrderItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ minimum: 1, example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ minimum: 0, example: 120.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice!: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  supplierId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  warehouseId!: string;

  @ApiProperty({ example: '2026-06-07' })
  @IsDateString()
  orderDate!: string;

  @ApiProperty({ enum: PurchaseOrderStatus, example: PurchaseOrderStatus.DRAFT })
  @IsEnum(PurchaseOrderStatus)
  status!: PurchaseOrderStatus;

  @ApiProperty({ type: [PurchaseOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items!: PurchaseOrderItemDto[];
}

export class UpdatePurchaseOrderStatusDto {
  @ApiProperty({
    enum: PurchaseOrderStatus,
    example: PurchaseOrderStatus.APPROVED,
  })
  @IsEnum(PurchaseOrderStatus)
  status!: PurchaseOrderStatus;
}

export class GetPurchaseOrderQueryDto {
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
  supplierId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ enum: PurchaseOrderStatus, example: PurchaseOrderStatus.DRAFT })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @ApiPropertyOptional({ example: 'keyboard' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  search?: string;
}

export class PurchaseOrderListResponseDto {
  @ApiProperty({ format: 'uuid' })
  purchaseOrderId!: string;

  @ApiProperty({ example: 'PO-2026-1780829766072' })
  purchaseOrderNumber!: string;

  @ApiProperty({ example: 'ABC Traders' })
  supplierName!: string;

  @ApiProperty({ example: 'Main Warehouse' })
  warehouseName!: string;

  @ApiProperty({ enum: PurchaseOrderStatus, example: PurchaseOrderStatus.DRAFT })
  status!: PurchaseOrderStatus;

  @ApiProperty({ example: 602.5 })
  totalCost!: number;

  @ApiProperty({ example: '2026-06-07' })
  orderDate?: string;
}

export class PurchaseOrderPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class PurchaseOrderPaginatedResponseDto {
  @ApiProperty({ type: [PurchaseOrderListResponseDto] })
  records!: PurchaseOrderListResponseDto[];

  @ApiProperty({ type: PurchaseOrderPaginationMetaDto })
  meta!: PurchaseOrderPaginationMetaDto;
}

export class SupplierInformationDto {
  @ApiProperty({ example: 'ABC Traders' })
  supplierName!: string;

  @ApiPropertyOptional({ example: 'Raj Mehta' })
  supplierContactPerson?: string;

  @ApiPropertyOptional({ example: 'raj@abctraders.com' })
  supplierEmail?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  supplierPhone?: string;

  @ApiPropertyOptional({ example: 'Market Road, Mumbai' })
  supplierAddress?: string;
}

export class DeliveryInformationDto {
  @ApiProperty({ example: 'Main Warehouse' })
  wareHouseName!: string;

  @ApiPropertyOptional({ example: 'Industrial Area, Sector 12' })
  wareHouseAddress?: string;

  @ApiPropertyOptional({ example: 'Amit Sharma' })
  wareHouseContactPerson?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  wareHousePhone?: string;
}

export class ProductItem {
  @ApiProperty({ example: 'Keyboard' })
  productName!: string;

  @ApiProperty({ example: 5 })
  quantity!: number;

  @ApiProperty({ example: 120.5 })
  unitPrice!: number;

  @ApiProperty({ example: 602.5 })
  totalPrice!: number;
}

export class PurchaseOrderDeatilsResponseDto {
  @ApiProperty({ format: 'uuid' })
  purchaseOrderId!: string;

  @ApiProperty({ example: 'PO-2026-1780829766072' })
  purchaseOrderNumber!: string;

  @ApiProperty({ enum: PurchaseOrderStatus, example: PurchaseOrderStatus.DRAFT })
  purchaseOrderStatus!: PurchaseOrderStatus;

  @ApiProperty({ example: '2026-06-07' })
  purchaseOrderDate!: string;

  @ApiProperty({ example: 602.5 })
  purchaseOrderTotalPrice!: number;

  @ApiProperty({ type: SupplierInformationDto })
  supplierInformation!: SupplierInformationDto;

  @ApiProperty({ type: DeliveryInformationDto })
  deliveryInformation!: DeliveryInformationDto;

  @ApiProperty({ type: [ProductItem] })
  productItems!: ProductItem[];
}

export class PurchaseOrderMessageResponseDto {
  @ApiProperty({ example: 'Purchase order created successfully' })
  @IsString()
  @IsNotEmpty()
  message!: string;
}
