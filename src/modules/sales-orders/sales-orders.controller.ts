import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SalesOrdersService } from './sales-orders.service';
import {
  CreateSalesOrderDto,
  GetSalesOrderOptionsQueryDto,
  GetSalesOrderQueryDto,
  SalesOrderDetailsResponseDto,
  SalesOrderMessageResponseDto,
  SalesOrderOptionDto,
  SalesOrderPaginatedResponseDto,
  UpdateSalesOrderStatusDto,
} from 'src/common/dto/sales-order.dto';
import { CurrentUser } from '../auth/currentuser.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiTags('Sales Orders')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('sales-orders')
export class SalesOrdersController {
    constructor(
        private readonly salesOrderService: SalesOrdersService
    ){}

    @Post()
    @Permissions(PERMISSION_CODES.SALES_CREATE)
    @ApiOperation({ summary: 'Create a sales order in the authenticated tenant' })
    @ApiCreatedResponse({ type: SalesOrderMessageResponseDto })
    public async createSalesOrder(
        @Body() createSalesOrderDto: CreateSalesOrderDto,
        @CurrentUser('tenantId') tenantId: string
    ){
        return await this.salesOrderService.createSalesOrder(createSalesOrderDto, tenantId)
    }

    @Patch(':salesOrderId')
    @Permissions(PERMISSION_CODES.SALES_MODIFY)
    @ApiOperation({ summary: 'Update sales order status' })
    @ApiParam({ name: 'salesOrderId', format: 'uuid' })
    @ApiOkResponse({ type: SalesOrderMessageResponseDto })
    public async updateSalesOrderStatus(
        @Body() updateSalesOrderDto: UpdateSalesOrderStatusDto,
        @Param('salesOrderId', ParseUUIDPipe) salesOrderId: string,
        @CurrentUser('tenantId') tenantId: string
    ){
        return await this.salesOrderService.updateSalesOrderStatus(updateSalesOrderDto, salesOrderId, tenantId)
    }

    @Get()
    @Permissions(PERMISSION_CODES.SALES_READ)
    @ApiOperation({ summary: 'List sales orders in the authenticated tenant' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'customerId', required: false, type: String, format: 'uuid' })
    @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] })
    @ApiQuery({ name: 'search', required: false, type: String, example: 'SO-2026' })
    @ApiOkResponse({ type: SalesOrderPaginatedResponseDto })
    public async getSalesOrders(
        @Query() getSalesOrderQueryDto: GetSalesOrderQueryDto,
        @CurrentUser('tenantId') tenantId: string
    ){
        return await this.salesOrderService.getSalesOrders(getSalesOrderQueryDto, tenantId)
    }

    @Get('details/:salesOrderId')
    @Permissions(PERMISSION_CODES.SALES_READ)
    @ApiOperation({ summary: 'Get sales order details' })
    @ApiParam({ name: 'salesOrderId', format: 'uuid' })
    @ApiOkResponse({ type: SalesOrderDetailsResponseDto })
    public async getSalesOrderDetails(
        @Param('salesOrderId', ParseUUIDPipe) salesOrderId: string,
        @CurrentUser('tenantId') tenantId: string
    ){
        return await this.salesOrderService.getSalesOrderDetails(salesOrderId, tenantId)
    }

  @Get('options')
  @Permissions(PERMISSION_CODES.SALES_READ)
  @ApiOperation({ summary: 'List sales order options in the authenticated tenant' })
  @ApiQuery({ name: 'customerId', required: false, type: String, format: 'uuid' })
  @ApiOkResponse({ type: [SalesOrderOptionDto] })
  public async salesOrderOptions(@Query() getSalesOrderQueryDto: GetSalesOrderOptionsQueryDto,@CurrentUser('tenantId') tenantId: string) {
    return await this.salesOrderService.salesOrderOptions(getSalesOrderQueryDto,tenantId)
  }

  @Get(':salesOrderId/download-pdf')
  @Permissions(PERMISSION_CODES.SALES_READ)
  @ApiParam({ name: 'salesOrderId', format: 'uuid' })
  @ApiOperation({ summary: 'Download sales order as PDF' })
  public async downloadSalesOrderPdf(
    @Param('salesOrderId', ParseUUIDPipe) salesOrderId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Res() res: Response,
  ) {
    const { buffer, fileName } = await this.salesOrderService.downloadPdf(salesOrderId, tenantId)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    })

    res.end(buffer)
  }
}
