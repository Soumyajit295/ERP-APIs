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
  IsEnum
} from 'class-validator';
import { SalesOrderStatus } from '../enums/sales-order.enum';

export class CreateSalesOrderItemDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @IsNumber()
  @Min(0)
  discount!: number;
}


export class CreateSalesOrderDto {
  @IsUUID()
  customerId!: string;

  @IsUUID()
  warehouseId!: string;

  @IsDateString()
  orderDate!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderItemDto)
  items!: CreateSalesOrderItemDto[];
}

export class UpdateSalesOrderStatusDto {
  @IsEnum(SalesOrderStatus)
  status!: SalesOrderStatus;
}