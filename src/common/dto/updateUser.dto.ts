import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
    @ApiProperty({ example: 'Jane' })
    @IsString()
    @IsNotEmpty()
    fname?: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lname?: string;

    @ApiPropertyOptional({ example: '+919876543211' })
    @IsString()
    @IsNotEmpty()
    phone?: string;

    @ApiProperty({ format: 'uuid', example: '6f7c2b31-0e41-4d43-9114-2e8f8f1ec2ff' })
    @IsString()
    @IsNotEmpty()
    roleId?: string;
}
