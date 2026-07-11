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
  Res,
} from '@nestjs/common';
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
import { PurchaseOrdersService } from './purchase-orders.service';
import {
  CreatePurchaseOrderDto,
  GetPurchaseOrderQueryDto,
  PurchaseOrderDeatilsResponseDto,
  PurchaseOrderMessageResponseDto,
  PurchaseOrderPaginatedResponseDto,
  PurchaseOrderStatusUpdateResponseDto,
  UpdatePurchaseOrderStatusDto,
} from 'src/common/dto/purchase-order.dto';
import { CurrentUser } from '../auth/currentuser.decorator';
import type { CurrentUserPayload } from '../auth/types/current-user.type';
import { Permissions } from '../auth/permissions.decorator';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiTags('Purchase Orders')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @Permissions(PERMISSION_CODES.PURCHASES_CREATE)
  @ApiOperation({
    summary: 'Create a purchase order in the authenticated tenant',
  })
  @ApiCreatedResponse({ type: PurchaseOrderMessageResponseDto })
  public async createPurchaseOrder(
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.purchaseOrdersService.createPurchaseOrder(
      createPurchaseOrderDto,
      user.tenantId,
    );
  }

  @Get()
  @Permissions(PERMISSION_CODES.PURCHASES_READ)
  @ApiOperation({
    summary: 'List purchase orders in the authenticated tenant',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'PO-2026',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED'],
  })
  @ApiQuery({
    name: 'supplierId',
    required: false,
    type: String,
    format: 'uuid',
  })
  @ApiQuery({
    name: 'warehouseId',
    required: false,
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({ type: PurchaseOrderPaginatedResponseDto })
  public async getPaginatedPurchaseOrders(
    @Query() getPurchaseOrderQueryDto: GetPurchaseOrderQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.purchaseOrdersService.getPaginatedPurchaseOrders(
      getPurchaseOrderQueryDto,
      user.tenantId,
    );
  }

  @Get(':purchaseOrderId')
  @Permissions(PERMISSION_CODES.PURCHASES_READ)
  @ApiParam({ name: 'purchaseOrderId', format: 'uuid' })
  @ApiOperation({ summary: 'Get purchase order details' })
  @ApiOkResponse({ type: PurchaseOrderDeatilsResponseDto })
  public async getPurchaseOrderDetails(
    @Param('purchaseOrderId', ParseUUIDPipe) purchaseOrderId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.purchaseOrdersService.getDetailsOfPurchaseOrder(
      purchaseOrderId,
      user.tenantId,
    );
  }

  @Patch('update-status/:purchaseOrderId')
  @Permissions(PERMISSION_CODES.PURCHASES_MODIFY)
  @ApiParam({ name: 'purchaseOrderId', format: 'uuid' })
  @ApiOperation({ summary: 'Update purchase order status' })
  @ApiOkResponse({ type: PurchaseOrderStatusUpdateResponseDto })
  public async updatePurchaseOrderStatus(
    @Body() updatePurchaseOrderStatusDto: UpdatePurchaseOrderStatusDto,
    @Param('purchaseOrderId', ParseUUIDPipe) purchaseOrderId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.purchaseOrdersService.updatePurchaseOrderStatus(
      updatePurchaseOrderStatusDto,
      purchaseOrderId,
      user.tenantId,
    );
  }

  @Delete(':purchaseOrderId')
  @Permissions(PERMISSION_CODES.PURCHASES_MODIFY)
  @ApiParam({ name: 'purchaseOrderId', format: 'uuid' })
  @ApiOperation({ summary: 'Delete a purchase order' })
  @ApiOkResponse({ type: PurchaseOrderMessageResponseDto })
  public async deletePurchaseOrder(
    @Param('purchaseOrderId', ParseUUIDPipe) purchaseOrderId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.purchaseOrdersService.deletePurchaseOrder(
      purchaseOrderId,
      user.tenantId,
    );
  }

  @Get(':purchaseOrderId/download-pdf')
  @Permissions(PERMISSION_CODES.PURCHASES_READ)
  @ApiParam({ name: 'purchaseOrderId', format: 'uuid' })
  @ApiOperation({ summary: 'Download purchase order as PDF' })
  public async downloadPurchaseOrderPDF(
    @Param('purchaseOrderId', ParseUUIDPipe) purchaseOrderId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Res() res: Response,
  ) {
    const { buffer, fileName } = await this.purchaseOrdersService.downloadPdf(
      purchaseOrderId,
      user.tenantId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    });

    res.end(buffer);
  }
}
