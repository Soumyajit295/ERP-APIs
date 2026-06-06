import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ maxLength: 255, example: 'ABC Traders' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  supplierName!: string;

  @ApiPropertyOptional({ maxLength: 255, example: 'Raj Mehta' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'raj@abctraders.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ maxLength: 20, example: '+919876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ maxLength: 1000, example: 'Market Road, Mumbai' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  address?: string;

  @ApiPropertyOptional({ maxLength: 100, example: 'GSTIN123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxNumber?: string;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class GetSupplierParamsDto {
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

export class SupplierResponseDto {
  @ApiProperty({ format: 'uuid' })
  supplierId!: string;

  @ApiProperty({ example: 'ABC Traders' })
  supplierName!: string;

  @ApiPropertyOptional({ example: 'Raj Mehta' })
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'raj@abctraders.com' })
  email?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Market Road, Mumbai' })
  address?: string;

  @ApiPropertyOptional({ example: 'GSTIN123456789' })
  taxNumber?: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class SupplierPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class SupplierPaginatedResponseDto {
  @ApiProperty({ type: [SupplierResponseDto] })
  records!: SupplierResponseDto[];

  @ApiProperty({ type: SupplierPaginationMetaDto })
  meta!: SupplierPaginationMetaDto;
}

export class SupplierOptionDto {
  @ApiProperty({ example: 'ABC Traders' })
  label!: string;

  @ApiProperty({ format: 'uuid' })
  value!: string;
}

export class SupplierMessageResponseDto {
  @ApiProperty({ example: 'Supplier created successfully' })
  message!: string;
}
