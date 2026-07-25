import { ApiProperty } from "@nestjs/swagger";

export class ModuleOptionDto {
    @ApiProperty({ example: 'Product' })
    label!: string;

    @ApiProperty({ format: 'uuid', example: 'e218dbbf-8afd-42d6-9ecf-2c35923ed920' })
    value!: string;
}

export class PermissionOptionDto {
    @ApiProperty({ example: 'create' })
    label!: string;

    @ApiProperty({ format: 'uuid', example: 'c1d2f3a4-1234-5678-9abc-def012345678' })
    value!: string;
}
