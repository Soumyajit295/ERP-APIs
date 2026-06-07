import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import {
  CreateSupplierDto,
  GetSupplierParamsDto,
  SupplierDetailsResponseDto,
  SupplierMessageResponseDto,
  SupplierOptionDto,
  SupplierPaginatedResponseDto,
  UpdateSupplierDto,
} from 'src/common/dto/supplier.dto';
import { CurrentUser } from '../auth/currentuser.decorator';
import type { CurrentUserPayload } from '../auth/types/current-user.type';
import { Permissions } from '../auth/permissions.decorator';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiTags('Suppliers')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly supplierService: SuppliersService) {}

  @Post()
  @Permissions(PERMISSION_CODES.SUPPLIERS_CREATE)
  @ApiOperation({ summary: 'Create a supplier in the authenticated tenant' })
  @ApiCreatedResponse({ type: SupplierMessageResponseDto })
  public async createSupplier(
    @Body() createSupplierDto: CreateSupplierDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.supplierService.createSupplier(
      createSupplierDto,
      user.tenantId,
    );
  }

  @Get()
  @Permissions(PERMISSION_CODES.SUPPLIERS_READ)
  @ApiOperation({ summary: 'List suppliers in the authenticated tenant' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'abc' })
  @ApiQuery({ name: 'status', required: false, type: Boolean, example: true })
  @ApiOkResponse({ type: SupplierPaginatedResponseDto })
  public async paginatedSupplier(
    @Query() getSupplierParamsDto: GetSupplierParamsDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.supplierService.paginatedSupplier(
      getSupplierParamsDto,
      user.tenantId,
    );
  }

  @Get('options')
  @Permissions(PERMISSION_CODES.SUPPLIERS_READ)
  @ApiOperation({
    summary: 'List supplier options in the authenticated tenant',
  })
  @ApiOkResponse({ type: [SupplierOptionDto] })
  public async getSupplierOptions(@CurrentUser() user: CurrentUserPayload) {
    return await this.supplierService.getSuppliersOptions(user.tenantId);
  }

  @Patch(':supplierId')
  @Permissions(PERMISSION_CODES.SUPPLIERS_MODIFY)
  @ApiParam({ name: 'supplierId', format: 'uuid' })
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiOkResponse({ type: SupplierMessageResponseDto })
  public async updateSupplier(
    @Body() updateSupplierDto: UpdateSupplierDto,
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.supplierService.updateSupplier(
      updateSupplierDto,
      supplierId,
      user.tenantId,
    );
  }

  @Delete(':supplierId')
  @Permissions(PERMISSION_CODES.SUPPLIERS_MODIFY)
  @ApiParam({ name: 'supplierId', format: 'uuid' })
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiOkResponse({ type: SupplierMessageResponseDto })
  public async deleteSupplier(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.supplierService.deleteSupplier(supplierId, user.tenantId);
  }

  @Get(':supplierId')
  @Permissions(PERMISSION_CODES.SUPPLIERS_READ)
  @ApiParam({ name: 'supplierId', format: 'uuid' })
  @ApiOperation({
    summary: 'Get supplier details',
  })
  @ApiOkResponse({ type: SupplierDetailsResponseDto })
  public async getSupplierDetails(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.supplierService.getSupplierDetails(
      supplierId,
      user.tenantId,
    );
  }
}
