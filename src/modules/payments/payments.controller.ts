import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  GetPaymentsQueryDto,
  PaymentDetailsDto,
  PaymentMessageResponseDto,
  PaymentPaginatedResponseDto,
} from 'src/common/dto/payment.dto';
import { CurrentUser } from '../auth/currentuser.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';
import { PaymentDirection, PaymentMethod } from 'src/common/enums/payment.enum';

@ApiTags('Payments')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post()
  @Permissions(PERMISSION_CODES.FINANCE_CREATE)
  @ApiOperation({ summary: 'Create a payment (received or made)' })
  @ApiCreatedResponse({ type: PaymentMessageResponseDto })
  public async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return await this.paymentService.createPayment(createPaymentDto, tenantId);
  }

  @Get()
  @Permissions(PERMISSION_CODES.FINANCE_READ)
  @ApiOperation({ summary: 'List payments in the authenticated tenant' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'paymentDirection',
    required: false,
    enum: PaymentDirection,
  })
  @ApiQuery({
    name: 'paymentMethod',
    required: false,
    enum: PaymentMethod,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'PAY-2026',
  })
  @ApiOkResponse({ type: PaymentPaginatedResponseDto })
  public async getPaginatedPayments(
    @Query() getPaymentQueryDto: GetPaymentsQueryDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return await this.paymentService.getPaginatedPayments(getPaymentQueryDto, tenantId);
  }

  @Get(':paymentId')
  @Permissions(PERMISSION_CODES.FINANCE_READ)
  @ApiOperation({ summary: 'Get payment details' })
  @ApiParam({ name: 'paymentId', format: 'uuid' })
  @ApiOkResponse({ type: PaymentDetailsDto })
  public async getPaymentDashboardData(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return await this.paymentService.getPaymentDashboardData(paymentId, tenantId);
  }

  @Get(':paymentId/download-recipt')
  @Permissions(PERMISSION_CODES.FINANCE_READ)
  @ApiParam({ name: 'paymentId', format: 'uuid' })
  @ApiOperation({ summary: 'Download payment receipt as PDF' })
  public async downloadPaymentRecipt(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Res() res: Response,
  ) {
    const { buffer, fileName } = await this.paymentService.downloadRecipt(paymentId, tenantId)

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
