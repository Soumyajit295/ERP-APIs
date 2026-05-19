import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    token!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}