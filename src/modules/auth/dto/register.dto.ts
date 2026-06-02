import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {

    @ApiProperty({ example: 'Acme Pvt Ltd' })
    @IsString()
    @IsNotEmpty()
    companyName!: string;

    @ApiPropertyOptional({ example: 'Mumbai' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    email!: string;

    @ApiPropertyOptional({ example: '+919876543210' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ minLength: 5, example: 'secret123' })
    @IsString()
    @MinLength(5, {
        message: 'Password should be at least 5 characters long'
    })
    password!: string;
}
