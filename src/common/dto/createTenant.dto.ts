import { IsNotEmpty, IsString } from "class-validator";

export class CreateTenantDto {
    @IsString()
    @IsNotEmpty()
    companyName!: string;

    @IsString()
    city?: string
}