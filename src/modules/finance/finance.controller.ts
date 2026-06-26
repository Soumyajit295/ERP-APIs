import { Controller, Get } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { Permissions } from '../auth/permissions.decorator';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import { CurrentUser } from '../auth/currentuser.decorator';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { FinanceDashboardResponseDto } from 'src/common/dto/finance.dto';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('finance')
export class FinanceController {
    constructor(
        private readonly financeService: FinanceService
    ){}

    @Get('dashboard')
    @Permissions(PERMISSION_CODES.FINANCE_READ)
    @ApiOperation({
        summary: 'Get finance dashboard',
        description:
        'Returns finance dashboard statistics including cash in, cash out, receivables, open payables and the latest payments.',
    })
    @ApiResponse({
        status: 200,
        description: 'Finance dashboard fetched successfully.',
        type: FinanceDashboardResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. Invalid or missing access token.',
    })
    @ApiForbiddenResponse({
        description: 'Forbidden. User does not have FINANCE_READ permission.',
    })
    @Permissions(PERMISSION_CODES.FINANCE_READ)
    public async getFinanceDashBoard(
        @CurrentUser('tenantId') tenantId: string
    ): Promise<FinanceDashboardResponseDto>{
        return await this.financeService.getFinaceDashboardData(tenantId)
    }
}
