import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetUsersQueryDto {
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

  @ApiPropertyOptional({ example: 'john' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by role ID' })
  @IsOptional()
  @IsString()
  roleId?: string;
}

export class UserResponse {
  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty({ example: 'John' })
  fname!: string;

  @ApiProperty({ example: 'Doe' })
  lname!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  phone?: string;

  @ApiProperty({ format: 'uuid' })
  tenantId!: string;

  @ApiProperty({ format: 'uuid' })
  roleId!: string;

  @ApiProperty({ example: 'MANAGER' })
  roleName!: string;
}

export class UserResponseMeta {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserResponse] })
  records!: UserResponse[];

  @ApiProperty({ type: UserResponseMeta })
  meta!: UserResponseMeta;
}
