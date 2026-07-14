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
import { InvoiceService } from './invoice.service';
import { Permissions } from '../auth/permissions.decorator';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import {
  createInvoiceDto,
  GetInvoiceQueryDto,
  InvoiceBySalesOrderResponseDto,
  InvoiceDetailsResponseDto,
  InvoiceMessageResponseDto,
  InvoicePaginatedResponseDto,
  updateInvoiceDto,
} from 'src/common/dto/invoice.dto';
import { CurrentUser } from '../auth/currentuser.decorator';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiTags('Invoice')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @Permissions(PERMISSION_CODES.FINANCE_CREATE)
  @ApiOperation({ summary: 'Create an invoice from a completed sales order' })
  @ApiCreatedResponse({ type: InvoiceMessageResponseDto })
  public async createInvoice(
    @Body() createInvoiceDto: createInvoiceDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return await this.invoiceService.createInvoice(createInvoiceDto, tenantId);
  }

  @Get()
  @Permissions(PERMISSION_CODES.FINANCE_READ)
  @ApiOperation({ summary: 'List invoices in the authenticated tenant' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'customerId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'salesOrderId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'status', required: false, enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'] })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'INV-2025' })
  @ApiOkResponse({ type: InvoicePaginatedResponseDto })
  public async getPaginatedInvoices(
    @Query() getInvoiceQueryDto: GetInvoiceQueryDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return await this.invoiceService.getPaginatedInvoices(getInvoiceQueryDto, tenantId);
  }

  @Patch(':invoiceId')
  @Permissions(PERMISSION_CODES.FINANCE_MODIFY)
  @ApiOperation({ summary: 'Update invoice details (due date / notes)' })
  @ApiParam({ name: 'invoiceId', format: 'uuid' })
  @ApiOkResponse({ type: InvoiceMessageResponseDto })
  public async updateInvoice(
    @Body() updateInvoiceDto: updateInvoiceDto,
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return await this.invoiceService.updateInvoiceDto(updateInvoiceDto, invoiceId, tenantId);
  }

  @Get('details/:invoiceId')
  @Permissions(PERMISSION_CODES.FINANCE_READ)
  @ApiOperation({ summary: 'Get invoice details' })
  @ApiParam({ name: 'invoiceId', format: 'uuid' })
  @ApiOkResponse({ type: InvoiceDetailsResponseDto })
  public async getInvoiceDetails(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return await this.invoiceService.getInvoiceDetails(invoiceId, tenantId);
  }

  @Get('sales-order/:salesOrderId')
  @Permissions(PERMISSION_CODES.FINANCE_READ)
  @ApiOperation({ summary: 'Get invoices by sales order ID' })
  @ApiParam({ name: 'salesOrderId', format: 'uuid' })
  @ApiOkResponse({ type: [InvoiceBySalesOrderResponseDto] })
  public async getInvoiceBySalesOrderId(
    @Param('salesOrderId', ParseUUIDPipe) salesOrderId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return await this.invoiceService.getInvoiceBySalesOrderId(salesOrderId, tenantId);
  }

  @Get(':invoiceId/download-pdf')
  @Permissions(PERMISSION_CODES.FINANCE_READ)
  @ApiParam({ name: 'invoiceId', format: 'uuid' })
  @ApiOperation({ summary: 'Download invoice as PDF' })
  public async downloadInvoicePdf(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Res() res: Response,
  ) {
    const { buffer, fileName } = await this.invoiceService.downloadPdf(invoiceId, tenantId)

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
