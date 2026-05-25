import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateRolesDto {
    @IsString()
    @IsNotEmpty()
    roleName!: string

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    moduleIds?: string[]
}
