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
import { CustomersService } from './customers.service';
import { Permissions } from '../auth/permissions.decorator';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import {
  CreateCustomerDto,
  CustomerListResponseDto,
  CustomerMessageResponseDto,
  GetCustomerQueryDto,
  UpdateCustomerDto,
} from 'src/common/dto/customer.dto';
import { CurrentUser } from '../auth/currentuser.decorator';
import type { CurrentUserPayload } from '../auth/types/current-user.type';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiTags('Customers')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customerService: CustomersService) {}

  @Post()
  @Permissions(PERMISSION_CODES.CUSTOMERS_CREATE)
  @ApiOperation({ summary: 'Create a customer in the authenticated tenant' })
  @ApiCreatedResponse({ type: CustomerMessageResponseDto })
  public async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.customerService.createCustomer(
      createCustomerDto,
      user.tenantId,
    );
  }

  @Get()
  @Permissions(PERMISSION_CODES.CUSTOMERS_READ)
  @ApiOperation({ summary: 'List customers in the authenticated tenant' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'acme' })
  @ApiQuery({ name: 'status', required: false, type: Boolean, example: true })
  @ApiOkResponse({ type: CustomerListResponseDto })
  public async getPaginatedCustomers(
    @Query() getCustomerQueryDto: GetCustomerQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.customerService.getPaginatedCustomers(
      getCustomerQueryDto,
      user.tenantId,
    );
  }

  @Patch(':customerId')
  @Permissions(PERMISSION_CODES.CUSTOMERS_MODIFY)
  @ApiParam({ name: 'customerId', format: 'uuid' })
  @ApiOperation({ summary: 'Update a customer' })
  @ApiOkResponse({ type: CustomerMessageResponseDto })
  public async updateCustomer(
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.customerService.updateCustomer(
      updateCustomerDto,
      customerId,
      user.tenantId,
    );
  }

  @Delete(':customerId')
  @Permissions(PERMISSION_CODES.CUSTOMERS_MODIFY)
  @ApiParam({ name: 'customerId', format: 'uuid' })
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiOkResponse({ type: CustomerMessageResponseDto })
  public async deleteCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return await this.customerService.deleteCustomer(customerId, user.tenantId);
  }
}
