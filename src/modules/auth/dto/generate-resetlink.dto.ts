import { IsEmail, IsNotEmpty } from "class-validator";

export class GenerateResetLinkDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string
}