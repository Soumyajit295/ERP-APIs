import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    fname?: string;

    @IsString()
    @IsNotEmpty()
    lname?: string;

    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @IsString()
    phone?: string;

    @IsString()
    @IsNotEmpty()
    password?: string;

    @IsString()
    @IsNotEmpty()
    roleId?: string;
}