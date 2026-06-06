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
import { WarehousesService } from './warehouses.service';
import {
  CreateWarehouseDto,
  GetWarehouseParamsDto,
  UpdateWarehouseDto,
  WarehouseMessageResponseDto,
  WarehouseOptionDto,
  WarehousePaginatedResponseDto,
} from 'src/common/dto/warehouse.dto';
import { CurrentUser } from '../auth/currentuser.decorator';
import type { CurrentUserPayload } from '../auth/types/current-user.type';
import { Permissions } from '../auth/permissions.decorator';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiTags('Warehouses')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehouseService: WarehousesService) {}

  @Post()
  @Permissions(PERMISSION_CODES.INVENTORY_CREATE)
  @ApiOperation({ summary: 'Create a warehouse in the authenticated tenant' })
  @ApiCreatedResponse({ type: WarehouseMessageResponseDto })
  public async createWarehouse(
    @Body() createWarehouseDto: CreateWarehouseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.warehouseService.createWarehouse(
      createWarehouseDto,
      user.tenantId,
    );
  }

  @Get()
  @Permissions(PERMISSION_CODES.INVENTORY_READ)
  @ApiOperation({ summary: 'List warehouses in the authenticated tenant' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'main' })
  @ApiQuery({ name: 'status', required: false, type: Boolean, example: true })
  @ApiOkResponse({ type: WarehousePaginatedResponseDto })
  public async getPaginatedWarehouse(
    @Query() getWarehouseParamsDto: GetWarehouseParamsDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.warehouseService.getPaginatedWarehouse(
      getWarehouseParamsDto,
      user.tenantId,
    );
  }

  @Get('options')
  @Permissions(PERMISSION_CODES.INVENTORY_READ)
  @ApiOperation({
    summary: 'List warehouse options in the authenticated tenant',
  })
  @ApiOkResponse({ type: [WarehouseOptionDto] })
  public async wareHouseOptions(@CurrentUser() user: CurrentUserPayload) {
    return await this.warehouseService.getWarehouseOptions(user.tenantId);
  }

  @Patch(':warehouseId')
  @Permissions(PERMISSION_CODES.INVENTORY_MODIFY)
  @ApiParam({ name: 'warehouseId', format: 'uuid' })
  @ApiOperation({ summary: 'Update a warehouse' })
  @ApiOkResponse({ type: WarehouseMessageResponseDto })
  public async updateWarehouse(
    @Body() updateWarehouseDto: UpdateWarehouseDto,
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.warehouseService.updateWarehouse(
      updateWarehouseDto,
      warehouseId,
      user.tenantId,
    );
  }

  @Delete(':warehouseId')
  @Permissions(PERMISSION_CODES.INVENTORY_MODIFY)
  @ApiParam({ name: 'warehouseId', format: 'uuid' })
  @ApiOperation({ summary: 'Delete a warehouse' })
  @ApiOkResponse({ type: WarehouseMessageResponseDto })
  public async deleteWarehouse(
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.warehouseService.deleteWarehouse(
      warehouseId,
      user.tenantId,
    );
  }
}
