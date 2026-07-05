import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class GetPermissionQueryDto {
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

    @ApiPropertyOptional({ format: 'uuid', description: 'Filter by module ID' })
    @IsOptional()
    @IsString()
    moduleId?: string;
}

export class PemissionsResponse {
    moduleId!: string
    moduleName!: string
    permissionId!: string
    permissionName!: string
}

export class PermissionResponseMeta {
    page!: number
    limit!: number
    total!: number
    totalPages!: number
}

export class PermissionListResponseDto {
    records!: PemissionsResponse[]
    meta!: PermissionResponseMeta
}
