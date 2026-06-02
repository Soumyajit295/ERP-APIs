import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTenantDto {
    @ApiProperty({ example: 'Acme Pvt Ltd' })
    @IsString()
    @IsNotEmpty()
    companyName!: string;

    @ApiPropertyOptional({ example: 'Mumbai' })
    @IsString()
    city?: string
}
