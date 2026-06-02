import { IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDto {
    @IsString()
    @IsNotEmpty()
    fname?: string;

    @IsString()
    @IsNotEmpty()
    lname?: string;

    @IsString()
    @IsNotEmpty()
    phone?: string;

    @IsString()
    @IsNotEmpty()
    roleId?: string;
}