import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";
import { TogglePermission } from "../enums/permission.enum";

export class TogglePermissionDto {
    @ApiProperty({ enum: TogglePermission, description: 'Action to perform: ASSIGN or REMOVE', example: TogglePermission.ASSIGN })
    @IsEnum(TogglePermission)
    @IsNotEmpty()
    action!: TogglePermission;

    @ApiProperty({ description: 'UUID of the permission to toggle', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    @IsUUID()
    @IsNotEmpty()
    permissionId!: string;
}