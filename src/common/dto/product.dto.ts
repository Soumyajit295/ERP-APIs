import {
  IsString,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  Min,
  IsInt,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ProductStatus } from '../enums/product.enum';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ minLength: 3, example: 'Wireless Keyboard' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @ApiProperty({ example: 'KB-WL-001' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiPropertyOptional({ example: '8901234567890' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ format: 'uuid', example: '7b5dfcbb-4d38-42da-a77c-972357f48f89' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ minimum: 0, example: 1200 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasePrice!: number;

  @ApiProperty({ minimum: 0, example: 1499 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @ApiPropertyOptional({ minimum: 0, default: 10, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  reorderLevel?: number;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  @IsEnum(ProductStatus)
  status!: ProductStatus;

  @ApiPropertyOptional({ minLength: 3, example: 'Compact Bluetooth keyboard for office use' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class GetProductQueryDto {
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
  categoryId?: string;

  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: 'keyboard' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;
}

export class ProductResponseDto {
  @ApiProperty({ format: 'uuid' })
  productId!: string;

  @ApiProperty({ example: 'Wireless Keyboard' })
  productName!: string;

  @ApiProperty({ example: 'KB-WL-001' })
  sku!: string;

  @ApiPropertyOptional({ example: '8901234567890' })
  barcode?: string;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  status!: ProductStatus;

  @ApiProperty({ example: 1200 })
  purchasePrice!: number;

  @ApiProperty({ example: 1499 })
  sellingPrice!: number;

  @ApiProperty({ example: 10 })
  reorderLevel!: number;

  @ApiProperty({ example: 'Electronics' })
  categoryName!: string;

  @ApiPropertyOptional({ example: 'Compact Bluetooth keyboard for office use' })
  description?: string;
}

export class ProductPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class ProductPaginatedResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  records!: ProductResponseDto[];

  @ApiProperty({ type: ProductPaginationMetaDto })
  meta!: ProductPaginationMetaDto;
}

export class ProductCategoryOptionDto {
  @ApiProperty({ example: 'Electronics' })
  label!: string;

  @ApiProperty({ format: 'uuid' })
  value!: string;
}

export class ProductMessageResponseDto {
  @ApiProperty({ example: 'Product created successfully' })
  message!: string;
}

export class ProductOptionDto {
  @ApiProperty({ example: 'Product 1' })
  label!: string;

  @ApiProperty({ format: 'uuid' })
  value!: string;
}

export class InventoryRecord {
  @ApiProperty({ example: 'Main Warehouse' })
  warehouseName!: string

  @ApiProperty({ example: 100 })
  quantity!: number

  @ApiProperty({ example: 10 })
  reservedQuantity!: number

  @ApiProperty({ example: 90 })
  availableQuantity!: number
}

export class ProductDetailsDto {
  @ApiProperty({ format: 'uuid' })
  productId!: string

  @ApiProperty({ example: 'Wireless Keyboard' })
  productName!: string

  @ApiProperty({ format: 'uuid' })
  categoryId!: string

  @ApiProperty({ example: 'Electronics' })
  categoryName!: string

  @ApiProperty({ example: 'KB-WL-001' })
  sku!: string

  @ApiPropertyOptional({ example: '8901234567890' })
  barcode!: string

  @ApiProperty({ example: 1499 })
  sellingPrice!: number

  @ApiProperty({ example: 1200 })
  costPrice!: number

  @ApiProperty({ example: 299 })
  profitPerUnit!: number

  @ApiProperty({ example: 24.92 })
  profitMargin!: number

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  status!: ProductStatus

  @ApiPropertyOptional({ example: 'Compact Bluetooth keyboard for office use' })
  description?: string

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  createdAt?: string

  @ApiPropertyOptional({ example: '2024-06-15T00:00:00.000Z' })
  updatedAt?: string

  @ApiPropertyOptional({ type: [InventoryRecord] })
  inventoryDetails?: InventoryRecord[]
}