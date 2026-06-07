import { ApiProperty } from "@nestjs/swagger";

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

export interface PaginatedResponseDto<T> {
  records: T[];
  meta: ProductPaginationMetaDto
}