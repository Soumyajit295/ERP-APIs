import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty({ minLength: 3, example: 'Electronics' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3,{message: 'Category should be at least 3 character long'})
    name!: string;

    @ApiPropertyOptional({ minLength: 3, example: 'Electronic accessories and devices' })
    @IsOptional()
    @IsString()
    @MinLength(3,{message: 'Description should be at least 3 charcter long'})
    description?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CategoryParamDto {
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

  @ApiPropertyOptional({ example: 'Electronics' })
  @IsOptional()
  @IsString()
  search?: string;
}
