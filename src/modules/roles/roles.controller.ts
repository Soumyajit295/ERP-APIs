import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwtAuth.guard';

@Controller('roles')
export class RolesController {
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles('ADMIN')
    @Get()
    public async getRole(){
        return 'Yeeeeeeeeeeeee....'
    }
}
