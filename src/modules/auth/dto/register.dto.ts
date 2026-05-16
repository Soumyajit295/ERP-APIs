import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength
} from 'class-validator';

export class RegisterDto {

    @IsString()
    @IsNotEmpty()
    companyName!: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsEmail()
    email!: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsString()
    @MinLength(5, {
        message: 'Password should be at least 5 characters long'
    })
    password!: string;
}