import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryDashboardResponseDto {
  @ApiProperty({ example: 250 })
  totalUnits!: number;

  @ApiProperty({ example: 125000 })
  totalCost!: number;

  @ApiProperty({ example: 3 })
  totalWarehouse!: number;

  @ApiProperty({ example: 7 })
  lowStockCount!: number;
}

export class InventoryProduct {
  @ApiProperty({ example: 'Wireless Keyboard' })
  productName!: string;

  @ApiProperty({ example: 'Electronics' })
  categoryName!: string;

  @ApiProperty({ example: 'KB-WL-001' })
  productSKU!: string;

  @ApiProperty({ example: 'Main Warehouse' })
  warehouseName!: string;

  @ApiProperty({ example: 25 })
  totalQuantity!: number;

  @ApiProperty({ example: 10 })
  reorderLevel!: number;

  @ApiProperty({ example: '2026-06-09T12:30:00.000Z' })
  updatedAt!: string;
}

export class InventoryProductsPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class InventoryProductsResponseDto {
  @ApiProperty({ type: [InventoryProduct] })
  records!: InventoryProduct[];

  @ApiProperty({ type: InventoryProductsPaginationMetaDto })
  meta!: InventoryProductsPaginationMetaDto;
}

export class GetInventoryProductsQueryDto {
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

  @ApiPropertyOptional({ example: 'keyboard' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  search?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
