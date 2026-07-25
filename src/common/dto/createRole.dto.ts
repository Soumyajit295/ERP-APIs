import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

class RoleModuleDto {
  @ApiProperty({
    example: 'e218dbbf-8afd-42d6-9ecf-2c35923ed920',
  })
  @IsUUID('4')
  moduleId!: string;

  @ApiProperty({
    type: [String],
    format: 'uuid',
    example: [
      'c1d2f3a4-1234-5678-9abc-def012345678',
      'd2e3f4a5-2345-6789-abcd-ef0123456789',
    ],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  permissions!: string[];
}

export class CreateRolesDto {
  @ApiProperty({
    example: 'Manager',
  })
  @IsString()
  @IsNotEmpty()
  roleName!: string;

  @ApiPropertyOptional({
    type: [RoleModuleDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleModuleDto)
  modules?: RoleModuleDto[];
}