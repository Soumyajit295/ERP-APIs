import { Controller, Get, Query } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/currentuser.decorator';
import { InventoryService } from './inventory.service';
import {
    GetInventoryProductsQueryDto,
    InventoryDashboardResponseDto,
    InventoryProductsResponseDto,
} from 'src/common/dto/inventory.dto';
import { Permissions } from '../auth/permissions.decorator';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiTags('Inventory')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('inventory')
export class InventoryController {
    constructor(
        private readonly inventoryService: InventoryService
    ){}

    @Get('dashboard')
    @Permissions(PERMISSION_CODES.INVENTORY_READ)
    @ApiOperation({ summary: 'Get inventory dashboard totals for the authenticated tenant' })
    @ApiOkResponse({ type: InventoryDashboardResponseDto })
    public async getInventoryDashboardData(
        @CurrentUser('tenantId') tenantId: string
    ){
        return await this.inventoryService.getInventoryDashboardData(tenantId)
    }

    @Get('products')
    @Permissions(PERMISSION_CODES.INVENTORY_READ)
    @ApiOperation({ summary: 'List inventory products in the authenticated tenant' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String, example: 'keyboard' })
    @ApiQuery({ name: 'warehouseId', required: false, type: String, format: 'uuid' })
    @ApiQuery({ name: 'categoryId', required: false, type: String, format: 'uuid' })
    @ApiOkResponse({ type: InventoryProductsResponseDto })
    public async getInventoryProducts(
        @Query() getInventoryProductQueryDto: GetInventoryProductsQueryDto,
        @CurrentUser('tenantId') tenantId: string
    ){
        return await this.inventoryService.getInventoryProducts(getInventoryProductQueryDto,tenantId)
    }
}
