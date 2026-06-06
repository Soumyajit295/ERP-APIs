import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({ maxLength: 255, example: 'Main Warehouse' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  warehouseName!: string;

  @ApiPropertyOptional({
    maxLength: 1000,
    example: 'Industrial Area, Sector 12',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  address?: string;

  @ApiPropertyOptional({ maxLength: 255, example: 'Amit Sharma' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @ApiPropertyOptional({ maxLength: 20, example: '+919876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ minimum: 0, example: 5000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  capacity?: number;
}

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class GetWarehouseParamsDto {
  @ApiPropertyOptional({ minimum: 1, default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 'main' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  status?: boolean;
}

export class WarehouseResponseDto {
  @ApiProperty({ format: 'uuid' })
  warehouseId!: string;

  @ApiProperty({ example: 'Main Warehouse' })
  warehouseName!: string;

  @ApiPropertyOptional({ example: 'Industrial Area, Sector 12' })
  address?: string;

  @ApiPropertyOptional({ example: 'Amit Sharma' })
  contactPerson?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  phone?: string;

  @ApiPropertyOptional({ example: 5000 })
  capacity?: number;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class WarehousePaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class WarehousePaginatedResponseDto {
  @ApiProperty({ type: [WarehouseResponseDto] })
  records!: WarehouseResponseDto[];

  @ApiProperty({ type: WarehousePaginationMetaDto })
  meta!: WarehousePaginationMetaDto;
}

export class WarehouseOptionDto {
  @ApiProperty({ example: 'Main Warehouse' })
  label!: string;

  @ApiProperty({ format: 'uuid' })
  value!: string;
}

export class WarehouseMessageResponseDto {
  @ApiProperty({ example: 'Warehouse created successfully' })
  message!: string;
}
