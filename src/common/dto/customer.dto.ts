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
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateCustomerDto {
  @ApiProperty({ maxLength: 255, example: 'Acme Retail' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  customerName!: string;

  @ApiPropertyOptional({ example: 'billing@acmeretail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ maxLength: 20, example: '+919876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ maxLength: 100, example: 'Mumbai' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ maxLength: 1000, example: 'Market Road, Mumbai' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  address?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class GetCustomerQueryDto {
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

  @ApiPropertyOptional({ example: 'acme' })
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

export class CustomerResponse {
  @ApiProperty({ format: 'uuid' })
  customerId!: string;

  @ApiProperty({ example: 'Acme Retail' })
  customerName!: string;

  @ApiPropertyOptional({ example: 'billing@acmeretail.com' })
  customerEmail?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  customerPhone?: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  customerCity?: string;

  @ApiProperty({ example: true })
  customerStatus!: boolean;
}

export class CustomerResponseMeta {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class CustomerListResponseDto {
  @ApiProperty({ type: [CustomerResponse] })
  records!: CustomerResponse[];

  @ApiProperty({ type: CustomerResponseMeta })
  meta!: CustomerResponseMeta;
}

export class CustomerMessageResponseDto {
  @ApiProperty({ example: 'Customer created successfully' })
  message!: string;
}

export class CustomerOptionDto {
  @ApiProperty({ example: 'Customer 1' })
  label!: string;

  @ApiProperty({ format: 'uuid' })
  value!: string;
}