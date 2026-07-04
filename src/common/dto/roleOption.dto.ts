import { ApiProperty } from "@nestjs/swagger";

export class RoleOptionDto {
    @ApiProperty({ example: 'Manager' })
    label!: string;

    @ApiProperty({ format: 'uuid' })
    value!: string;
}
