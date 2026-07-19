import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from 'src/common/dto/dashboard.dto';
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
}
