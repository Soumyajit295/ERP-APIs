import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  DashboardResponseDto,
  DashboardRevenueDetailDto,
} from 'src/common/dto/dashboard.dto';
import { CurrentUser } from '../auth/currentuser.decorator';
import type { CurrentUserPayload } from '../auth/types/current-user.type';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Get aggregated dashboard data for the authenticated tenant',
  })
  @ApiOkResponse({ type: DashboardResponseDto })
  public async getDashboardData(@CurrentUser() user: CurrentUserPayload) {
    return await this.dashboardService.getDashboardData(user.tenantId);
  }

  @Get('revenue-details')
  @ApiOperation({
    summary: 'Get monthly revenue and order count details for the authenticated tenant',
  })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filter revenue details by year (defaults to current year)' })
  @ApiOkResponse({ type: DashboardRevenueDetailDto, isArray: true })
  public async getRevenueDetails(
    @CurrentUser('tenantId') tenantId: string,
    @Query('year') year?: number,
  ) {
    const selectedYear = year ?? new Date().getFullYear();
    return await this.dashboardService.getRevenueDetails(tenantId, selectedYear)
  }
}
