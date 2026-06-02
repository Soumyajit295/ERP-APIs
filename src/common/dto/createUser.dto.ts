import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({ example: 'Jane' })
    @IsString()
    @IsNotEmpty()
    fname?: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lname?: string;

    @ApiProperty({ example: 'jane.doe@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @ApiPropertyOptional({ example: '+919876543211' })
    @IsString()
    phone?: string;

    @ApiProperty({ minLength: 5, example: 'secret123' })
    @IsString()
    @IsNotEmpty()
    password?: string;

    @ApiProperty({ format: 'uuid', example: '6f7c2b31-0e41-4d43-9114-2e8f8f1ec2ff' })
    @IsString()
    @IsNotEmpty()
    roleId?: string;
}
