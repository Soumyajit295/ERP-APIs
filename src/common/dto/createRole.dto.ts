import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateRolesDto {
    @ApiProperty({ example: 'Manager' })
    @IsString()
    @IsNotEmpty()
    roleName!: string

    @ApiPropertyOptional({
        type: [String],
        format: 'uuid',
        example: ['e218dbbf-8afd-42d6-9ecf-2c35923ed920']
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    moduleIds?: string[]
}
