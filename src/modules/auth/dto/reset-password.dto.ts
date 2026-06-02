import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
    @ApiProperty({ example: 'reset-token-from-email' })
    @IsEmail()
    @IsNotEmpty()
    token!: string;

    @ApiProperty({ example: 'newSecret123' })
    @IsString()
    @IsNotEmpty()
    password!: string;
}
