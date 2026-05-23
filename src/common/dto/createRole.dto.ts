import { IsNotEmpty, IsString } from "class-validator";

export class CreateRolesDto {
    @IsString()
    @IsNotEmpty()
    roleName!: string
}